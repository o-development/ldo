import { describe, it, beforeEach, vi, expect } from "vitest";
import { createLdoVueMethods } from "../src/index";
import {
  type SolidConnectedPlugin,
  solidConnectedPlugin,
} from "@ldo/connected-solid";
import { withSetup } from "./test-utils.js";
import assert from "node:assert";
import { setupServer } from "@ldo/test-solid-server";
import { nextTick, ref } from "vue";

describe("LDO Vue Composables", () => {
  let methods: ReturnType<typeof createLdoVueMethods<[SolidConnectedPlugin]>>;
  const s = setupServer(3006, {
    slug: "directory/",
    isContainer: true,
    contains: [
      {
        slug: "leaf",
        isContainer: false,
        data: "<https://example.com/vocab#me> <https://example.com/vocab#is> <https://example.com/vocab#happy> .",
        mimeType: "text/turtle",
      },
    ],
  });

  beforeEach(() => {
    methods = createLdoVueMethods([solidConnectedPlugin]);
    methods.dataset.setContext("solid", { fetch: s.authFetch });
  });

  describe("useTrackingProxy", () => {
    it("should return a LinkedDataObject");
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

      const rootContainerResult = await result.value.getRootContainer();

      assert(!rootContainerResult.isError);
      console.log(rootContainerResult.uri);

      app.unmount();
    });

    it("should fetch the new resource when uri changes", async () => {
      const uriRef = ref("http://localhost:3006/directory/");
      const [result, app] = withSetup(() => methods.useResource(uriRef));

      expect(result.value.isFetched()).toBe(false);

      await vi.waitFor(() => {
        if (!result.value.isFetched()) {
          throw new Error("not fetched yet");
        }
      });

      expect(result.value.isFetched()).toBe(true);
      expect(result.value.type).toEqual("SolidContainer");

      uriRef.value = "http://localhost:3006/directory/leaf";
      await nextTick();

      expect(result.value.isFetched()).toBe(false);
      expect(result.value.uri).toEqual("http://localhost:3006/directory/leaf");

      await vi.waitFor(() => {
        if (!result.value.isFetched()) {
          throw new Error("not fetched yet");
        }
      });

      expect(result.value.isFetched()).toBe(true);
      expect(result.value.type).toEqual("SolidLeaf");

      app.unmount();
    });
  });
});
