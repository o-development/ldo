import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "es2021",
  unbundle: true,
  dts: true,
  clean: true,
  outDir: "dist",
  tsconfig: "tsconfig.esm.json",
  skipNodeModulesBundle: true,
});
