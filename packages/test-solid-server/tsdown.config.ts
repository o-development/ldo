import { defineConfig } from "tsdown";
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

function copyConfigs() {
  return {
    name: "copy-configs",
    buildEnd() {
      const src = join(import.meta.dirname, "src/configs");
      const dest = join(import.meta.dirname, "dist/configs");
      mkdirSync(dest, { recursive: true });
      for (const file of readdirSync(src)) {
        copyFileSync(join(src, file), join(dest, file));
      }
    },
  };
}

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  fixedExtension: false,
  target: "es2021",
  unbundle: true,
  dts: true,
  clean: true,
  outDir: "dist",
  tsconfig: "tsconfig.build.json",
  skipNodeModulesBundle: true,
  plugins: [copyConfigs()],
});
