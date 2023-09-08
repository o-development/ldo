import type { App } from "@solid/community-server";
import { LeafRequester } from "../src/requester/LeafRequester";
import crossFetch from "cross-fetch";
import {
  createApp,
  getSecret,
  refreshToken,
  type ISecretData,
  type ITokenData,
  getAuthenticatedFetch,
} from "./solidServer.helper";
import { buildAuthenticatedFetch } from "@inrupt/solid-client-authn-core";

describe("Leaf Requester", () => {
  let app: App;
  let authFetch: typeof fetch;

  beforeAll(async () => {
    // Start up the server
    // app = await createApp();
    // await app.start();

    authFetch = await getAuthenticatedFetch();
  });

  it("special request", async () => {
    const response = await authFetch(
      "https://solidweb.me/jackson/everything_public/anonexistentfile.json",
      {
        method: "PUT",
        headers: { "content-type": "application/json+ld" },
        body: JSON.stringify({ some: "test" }),
      },
    );
    console.log("STATUS:", response.status);
    console.log("HEADERS:", response.headers);
    console.log("BODY:", await response.text());
  });

  it("reads", async () => {
    const leafRequester = new LeafRequester(
      "https://solidweb.me/jackson/everything-public/someotherfile.json",
      { fetch: authFetch },
    );

    await leafRequester.read();
  });
});
