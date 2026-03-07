#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;
const packagesDir = path.join(repoRoot, "packages");

const fileExtensions = [".ts", ".tsx", ".mts", ".cts"];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["dist", "node_modules", "coverage"].includes(entry.name)) continue;
      files.push(...(await walk(fullPath)));
      continue;
    }
    if (
      entry.isFile() &&
      fileExtensions.some((ext) => entry.name.endsWith(ext))
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

function rewriteImports(source) {
  const importExportPattern =
    /(\b(?:import|export)\s+(?:[^;]*?\s+from\s+)?["'])(\.{1,2}\/[^"']+)\.js(["'])/g;
  const dynamicImportPattern =
    /(\bimport\(\s*["'])(\.{1,2}\/[^"']+)\.js(["']\s*\))/g;
  const requirePattern =
    /(\brequire\(\s*["'])(\.{1,2}\/[^"']+)\.js(["']\s*\))/g;

  return source
    .replace(importExportPattern, "$1$2$3")
    .replace(dynamicImportPattern, "$1$2$3")
    .replace(requirePattern, "$1$2$3");
}

async function main() {
  const files = await walk(packagesDir);
  for (const filePath of files) {
    const source = await fs.readFile(filePath, "utf8");
    const updated = rewriteImports(source);
    if (updated !== source) {
      await fs.writeFile(filePath, updated, "utf8");
    }
  }
}

await main();
