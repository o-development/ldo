import { spawn } from "node:child_process";
import { access, readFile, readdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const packagesDir = path.join(repoRoot, "packages");

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function getManifestPaths() {
  const paths = [
    path.join(repoRoot, "package.json"),
    path.join(repoRoot, "lerna.json"),
  ];
  const packageLockPath = path.join(repoRoot, "package-lock.json");
  if (await fileExists(packageLockPath)) {
    paths.push(packageLockPath);
  }

  const packageDirs = await readdir(packagesDir, { withFileTypes: true });

  for (const dirent of packageDirs) {
    if (!dirent.isDirectory()) continue;
    const manifestPath = path.join(packagesDir, dirent.name, "package.json");
    if (await fileExists(manifestPath)) {
      paths.push(manifestPath);
    }
  }

  return paths;
}

async function snapshotManifests(manifestPaths) {
  const snapshots = new Map();
  for (const manifestPath of manifestPaths) {
    snapshots.set(manifestPath, await readFile(manifestPath, "utf8"));
  }
  return snapshots;
}

async function restoreManifests(snapshots) {
  for (const [manifestPath, contents] of snapshots.entries()) {
    await writeFile(manifestPath, contents, "utf8");
  }
}

async function main() {
  const manifestPaths = await getManifestPaths();
  const snapshots = await snapshotManifests(manifestPaths);
  const lernaArgs = ["publish", "--no-private", ...process.argv.slice(2)];

  let child;
  let restored = false;

  const rollback = async () => {
    if (restored) return;
    restored = true;
    await restoreManifests(snapshots);
  };

  const onSignal = async (signal) => {
    if (child && !child.killed) {
      child.kill(signal);
    }

    try {
      await rollback();
      // eslint-disable-next-line no-console
      console.error(
        `\nPublish interrupted (${signal}). package.json files were restored.`,
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        "\nPublish interrupted and rollback failed. Please restore manually.",
      );
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      process.exit(1);
    }
  };

  process.once("SIGINT", () => void onSignal("SIGINT"));
  process.once("SIGTERM", () => void onSignal("SIGTERM"));

  child = spawn("npx", ["--no-install", "lerna", ...lernaArgs], {
    cwd: repoRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", async (code) => {
    if (code === 0) {
      process.exit(0);
      return;
    }

    try {
      await rollback();
      // eslint-disable-next-line no-console
      console.error("\nPublish failed. package.json files were restored.");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        "\nPublish failed and rollback failed. Please restore manually.",
      );
      // eslint-disable-next-line no-console
      console.error(error);
    }

    process.exit(code ?? 1);
  });
}

main().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
