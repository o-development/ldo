import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  unbundle: true,
  dts: true,
  clean: true,
  outDir: "dist",
  tsconfig: "tsconfig.esm.json",
  skipNodeModulesBundle: true,
});
