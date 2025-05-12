import { createApp } from "@ldo/test-solid-server/dist/createServer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const app = await createApp(
    3004,
    path.join(
      __dirname,
      "./configs/components-config/unauthenticatedServer.json",
    ),
  );
  await app.start();
}
run();
