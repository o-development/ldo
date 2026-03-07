import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess({ typescript: true }),
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^@ldo\/([^/]+)$/,
        replacement: path.resolve(__dirname, "../$1/src/index.ts"),
      },
      {
        find: /^@ldo\/([^/]+)\/(.*)$/,
        replacement: path.resolve(__dirname, "../$1/$2"),
      },
    ],
  },
  test: {
    globals: true,
    setupFiles: ["../../vitest.jest-compat.ts"],
    environment: "jsdom",
    exclude: ["example/**", "dist/**", "node_modules/**"],
    coverage: {
      provider: "istanbul",
      exclude: ["example/**"],
    },
  },
});
