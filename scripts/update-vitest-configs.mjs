#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const packagesDir = path.join(new URL("..", import.meta.url).pathname, "packages");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

const aliasBlock = `  resolve: {
    alias: [
      {
        find: /^@ldo\\/([^/]+)$/,
        replacement: path.resolve(__dirname, "../$1/src/index.ts"),
      },
      {
        find: /^@ldo\\/([^/]+)\\/(.*)$/,
        replacement: path.resolve(__dirname, "../$1/$2"),
      },
    ],
  },
`;

const files = (await walk(packagesDir)).filter((file) =>
  file.endsWith("vitest.config.js"),
);

for (const file of files) {
  let content = await fs.readFile(file, "utf8");

  if (!content.includes('import path from "node:path";')) {
    content = content.replace(
      'import { defineConfig } from "vitest/config";\n',
      'import { defineConfig } from "vitest/config";\nimport path from "node:path";\nimport { fileURLToPath } from "node:url";\n',
    );
  }

  if (!content.includes("const __dirname =")) {
    content = content.replace(
      "\nexport default defineConfig(",
      "\nconst __dirname = path.dirname(fileURLToPath(import.meta.url));\n\nexport default defineConfig(",
    );
  }

  if (!content.includes("resolve: {")) {
    content = content.replace("  test: {", `${aliasBlock}  test: {`);
  }

  if (!content.includes("setupFiles")) {
    content = content.replace(
      "    globals: true,\n",
      '    globals: true,\n    setupFiles: ["../../vitest.jest-compat.ts"],\n',
    );
  }

  if (!content.includes("globals: true")) {
    content = content.replace("  test: {\n", "  test: {\n    globals: true,\n");
  }

  await fs.writeFile(file, content, "utf8");
}
