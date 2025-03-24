import { createApp } from "./solidServer.helper";

async function run() {
  const app = await createApp();
  await app.start();
}
run();
