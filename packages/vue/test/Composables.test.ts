import { describe, it, beforeEach, vi, expect } from "vitest";
import { createLdoVueMethods, type UseResourceOptions } from "../src/index";
import {
  type SolidConnectedPlugin,
  solidConnectedPlugin,
  type SolidContainerUri,
} from "@ldo/connected-solid";
import { withSetup } from "./test-utils.js";
import assert from "node:assert";
import { setupServer } from "@ldo/test-solid-server";
import { nextTick, type Ref, ref, watch } from "vue";
import { FoafProfileShapeType } from "./_ldo/foafProfile.shapeTypes";

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
      {
        slug: "person",
        isContainer: false,
        data: `
        @prefix foaf: <http://xmlns.com/foaf/0.1/>.
        <#me>
          a foaf:Person;
          foaf:name "Name";
          foaf:knows <https://example.com/profile/card#me>, <https://example.org/profile/card#i>.
        `,
        mimeType: "text/turtle",
      },
    ],
  });

  beforeEach(() => {
    methods = createLdoVueMethods([solidConnectedPlugin]);
    methods.dataset.setContext("solid", { fetch: s.authFetch });
  });

  describe("useTrackingProxy", () => {
    it.todo("should return a LinkedDataObject");
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

    it("should handle change in options", async () => {
      s.fetchMock.mockClear();

      const uriRef: Ref<SolidContainerUri, SolidContainerUri> = ref(
        "http://localhost:3006/directory/",
      );
      const optionsRef: Ref<UseResourceOptions<"solid">> = ref({
        suppressInitialRead: true,
      });
      const [result, app] = withSetup(() =>
        methods.useResource(uriRef, optionsRef),
      );

      expect(result.value.isFetched()).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(result.value.isFetched()).toBe(false);

      optionsRef.value = { suppressInitialRead: false };

      await vi.waitFor(() => {
        if (!result.value.isFetched()) {
          throw new Error("not fetched yet");
        }
      });

      expect(result.value.isFetched()).toBe(true);

      app.unmount();
    });
  });

  describe("useSubject", () => {
    it("should return a linked data object with given subject uri", async () => {
      let rerenderCount = 0;

      const [result, app] = withSetup(() => {
        const useSubjectResult = methods.useSubject(
          FoafProfileShapeType,
          "http://localhost:3006/directory/person#me",
        );
        const useResourceResult = methods.useResource(
          "http://localhost:3006/directory/person",
        );

        return [useSubjectResult, useResourceResult] as const;
      });

      watch(result, () => {
        rerenderCount++;
      });

      expect(rerenderCount).toEqual(0);

      await vi.waitFor(() => {
        if (!result[1].value.isFetched()) {
          throw new Error("not fetched yet");
        }
      });

      expect(rerenderCount).toEqual(1);

      assert(!result[1].value.isError);
      expect(result[1].value.isAbsent()).toBe(false);

      expect(result[0].value.name).toEqual("Name");
      const knows = result[0].value.knows?.map((k) => k["@id"]);
      expect(knows).toHaveLength(2);
      expect(knows).toContain("https://example.com/profile/card#me");
      expect(knows).toContain("https://example.org/profile/card#i");

      app.unmount();
    });

    it.todo("should change the LDO when the subject changes");
    it.todo("should change the LDO when the shape type changes");
    it.todo("should change the LDO when the options.dataset changes");
  });
});
