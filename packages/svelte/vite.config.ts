// packages/my-svelte-lib/vite.config.ts
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import dts from "vite-plugin-dts";
import path from "path";
import pkg from "./package.json" assert { type: "json" }; // Updated import

const ldoAndRdfDeps = Object.keys(pkg.dependencies || {}).filter(
  (dep) => dep.startsWith("@ldo/") || dep.startsWith("@rdfjs/"),
);

const externalDeps = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...ldoAndRdfDeps,
  /^svelte(\/.+)?$/,
];

export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        typescript: true,
      }),
    }),
    dts({
      outDir: "dist",
      insertTypesEntry: true,
    }),
  ],
  build: {
    outDir: "dist",
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "LdoSvelte",
      fileName: (format) => {
        if (format === "es") return "index.mjs";
        if (format === "cjs") return "index.cjs";
        return `index.${format}.js`;
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: externalDeps,
      output: {
        exports: "auto",
      },
    },
  },
  resolve: {
    dedupe: ["svelte"],
    alias: {
      $lib: path.resolve(__dirname, "src"),
    },
  },
});
