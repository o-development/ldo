import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@ldo/solid-react",
        replacement: path.resolve(__dirname, "../src/index.ts"),
      },
      {
        find: /^@ldo\/([^/]+)$/,
        replacement: path.resolve(__dirname, "../../$1/src/index.ts"),
      },
      {
        find: /^@ldo\/([^/]+)\/(.*)$/,
        replacement: path.resolve(__dirname, "../../$1/$2"),
      },
    ],
  },
  server: {
    port: 5174,
    strictPort: false,
  },
});
