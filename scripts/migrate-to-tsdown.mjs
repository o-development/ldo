#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;
const packagesDir = path.join(repoRoot, "packages");

const isRelative = (value) => value.startsWith(".") || value.startsWith("/");
const isBuiltin = (value) =>
  value.startsWith("node:") ||
  [
    "fs",
    "path",
    "url",
    "util",
    "stream",
    "crypto",
    "events",
    "os",
    "assert",
    "zlib",
    "http",
    "https",
    "net",
    "tls",
    "buffer",
    "querystring",
    "timers",
    "readline",
    "perf_hooks",
    "child_process",
    "worker_threads",
    "module",
  ].includes(value);

function getPackageName(specifier) {
  if (specifier.startsWith("@")) {
    const [scope, name] = specifier.split("/");
    return scope && name ? `${scope}/${name}` : specifier;
  }
  return specifier.split("/")[0];
}

async function collectSourceFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await collectSourceFiles(fullPath)));
      continue;
    }
    if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !entry.name.endsWith(".d.ts")
    ) {
      output.push(fullPath);
    }
  }
  return output;
}

function extractImports(source) {
  const imports = new Set();
  const importFromRegex = /\b(?:import|export)\s+(?:[^;]*?\s+from\s+)?["']([^"']+)["']/g;
  const dynamicImportRegex = /\bimport\(\s*["']([^"']+)["']\s*\)/g;
  const requireRegex = /\brequire\(\s*["']([^"']+)["']\s*\)/g;
  for (const regex of [importFromRegex, dynamicImportRegex, requireRegex]) {
    let match;
    while ((match = regex.exec(source)) !== null) {
      imports.add(match[1]);
    }
  }
  return imports;
}

function updateExports(pkg) {
  const packageJsonExport = pkg.exports?.["./package.json"] ?? "./package.json";
  pkg.exports = {
    ".": {
      import: {
        types: "./dist/index.d.ts",
        default: "./dist/index.js",
      },
      require: {
        types: "./dist/index.d.cts",
        default: "./dist/index.cjs",
      },
    },
    "./package.json": packageJsonExport,
  };
}

function ensureDependenciesForRuntimeImports(pkg, runtimeImports, packageVersions) {
  if (!pkg.dependencies) pkg.dependencies = {};
  const depBuckets = [
    pkg.dependencies ?? {},
    pkg.peerDependencies ?? {},
    pkg.optionalDependencies ?? {},
  ];

  for (const imported of runtimeImports) {
    if (isRelative(imported) || isBuiltin(imported)) continue;
    const packageName = getPackageName(imported);
    const alreadyRuntime = depBuckets.some((bucket) => packageName in bucket);
    if (alreadyRuntime) continue;
    if (pkg.devDependencies?.[packageName]) {
      pkg.dependencies[packageName] = pkg.devDependencies[packageName];
      delete pkg.devDependencies[packageName];
      continue;
    }
    if (packageName.startsWith("@ldo/") && packageVersions[packageName]) {
      pkg.dependencies[packageName] = `^${packageVersions[packageName]}`;
    }
  }
}

function updateScripts(pkg) {
  if (!pkg.scripts) pkg.scripts = {};
  pkg.scripts.build = "rimraf dist && NODE_OPTIONS=--max-old-space-size=8192 tsdown";
  delete pkg.scripts["build:cjs"];
  delete pkg.scripts["build:esm"];
  if (typeof pkg.scripts.prepublishOnly === "string") {
    pkg.scripts.prepublishOnly = pkg.scripts.prepublishOnly.trim();
  } else {
    pkg.scripts.prepublishOnly = "npm run build";
  }
}

async function writeTsdownConfig(packagePath) {
  const configPath = path.join(packagePath, "tsdown.config.ts");
  const config = `import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  unbundle: true,
  dts: true,
  clean: true,
  outDir: "dist",
  tsconfig: "tsconfig.esm.json",
  deps: {
    skipNodeModulesBundle: true,
  },
});
`;
  await fs.writeFile(configPath, config, "utf8");
}

async function main() {
  const packageDirs = await fs.readdir(packagesDir, { withFileTypes: true });
  const packageVersions = {};
  for (const entry of packageDirs) {
    if (!entry.isDirectory()) continue;
    const packagePath = path.join(packagesDir, entry.name);
    const packageJsonPath = path.join(packagePath, "package.json");
    try {
      const packageJsonRaw = await fs.readFile(packageJsonPath, "utf8");
      const pkg = JSON.parse(packageJsonRaw);
      if (pkg.name && pkg.version) {
        packageVersions[pkg.name] = pkg.version;
      }
    } catch {
      // Ignore folders that are not npm packages.
    }
  }

  for (const entry of packageDirs) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "cli") continue;
    const packagePath = path.join(packagesDir, entry.name);
    const packageJsonPath = path.join(packagePath, "package.json");
    try {
      await fs.access(packageJsonPath);
    } catch {
      continue;
    }

    const packageJsonRaw = await fs.readFile(packageJsonPath, "utf8");
    const pkg = JSON.parse(packageJsonRaw);
    if (!pkg.name?.startsWith("@ldo/")) continue;
    const usesDualEntrypoints =
      pkg.main === "./dist/index.cjs" ||
      pkg.module === "./dist/index.js" ||
      pkg.main?.includes("dist/cjs") ||
      pkg.module?.includes("dist/esm");
    if (!usesDualEntrypoints) continue;

    const srcDir = path.join(packagePath, "src");
    let runtimeImports = new Set();
    try {
      const sourceFiles = await collectSourceFiles(srcDir);
      for (const filePath of sourceFiles) {
        const source = await fs.readFile(filePath, "utf8");
        extractImports(source).forEach((specifier) => runtimeImports.add(specifier));
      }
    } catch {
      // If package has no src, skip runtime import checks.
    }

    pkg.main = "./dist/index.cjs";
    pkg.module = "./dist/index.js";
    pkg.types = "./dist/index.d.ts";

    updateExports(pkg);
    ensureDependenciesForRuntimeImports(pkg, runtimeImports, packageVersions);
    updateScripts(pkg);

    await fs.writeFile(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
    await writeTsdownConfig(packagePath);
  }
}

await main();
