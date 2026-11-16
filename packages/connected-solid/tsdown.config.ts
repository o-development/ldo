import { defineConfig } from "tsdown";

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
});
