import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
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
    coverage: {
      provider: "istanbul",
    },
    environment: "jsdom",
  },
});
