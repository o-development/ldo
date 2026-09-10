import { describe, it, beforeEach, vi, expect } from "vitest";
import { createLdoVueMethods } from "../src/index";
import {
  type SolidConnectedPlugin,
  solidConnectedPlugin,
} from "@ldo/connected-solid";
import { withSetup } from "./test-utils.js";
import assert from "node:assert";
import { setupServer } from "@ldo/test-solid-server";

describe("LDO Vue Composables", () => {
  let methods: ReturnType<typeof createLdoVueMethods<[SolidConnectedPlugin]>>;
  const s = setupServer(
    3006,
    {
      slug: "directory/",
      isContainer: true,
      contains: [],
    },
    // undefined,
    // true,
  );

  beforeEach(() => {
    methods = createLdoVueMethods([solidConnectedPlugin]);
    methods.dataset.setContext("solid", { fetch: s.authFetch });
  });

  describe("useResource", () => {
    it("should fetch a resource by uri", async () => {
      const [result, app] = withSetup(() =>
        methods.useResource("http://localhost:3006/directory/"),
      );

      expect(result.value.isFetched()).toBe(false);

      await vi.waitFor(() => {
        if (!result.value.isFetched()) {
          throw new Error("not fetched yet");
        }
      });

      expect(result.value.isFetched()).toBe(true);

      expect(result.value.type).toEqual("SolidContainer");

      const headersResult = await result.value.getHeaders();
      assert(!headersResult.isError);

      console.log(Object.fromEntries(headersResult.headers.entries()));

      app.unmount();
    });
  });
});
