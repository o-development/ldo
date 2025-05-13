import { createApp } from "./solidServer.helper.js";

async function run() {
  const app = await createApp();
  await app.start();
}
run();
