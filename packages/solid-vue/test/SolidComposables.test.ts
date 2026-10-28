import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MockSharedWorker, withParentChildSetup } from "./test-utils";
import { createBrowserSolidVueComposables } from "@ldo/solid-vue";
import { setupServer } from "@ldo/test-solid-server";
import { type CreateAppFunction, nextTick, type Ref, ref } from "vue";
import type {
  SolidContainer,
  SolidContainerUri,
  SolidLeafUri,
} from "@ldo/connected-solid";
import type { UseResourceOptions } from "../src/index";

describe("Composables for Solid", () => {
  let methods: ReturnType<typeof createBrowserSolidVueComposables<never>>;
  const personResourceUri = "http://localhost:3006/directory/person";
  const person2ResourceUri = "http://localhost:3006/directory/person2";

  setupServer(3006, {
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
        <> a foaf:PersonalProfileDocument.
        <#me>
          a foaf:Person;
          foaf:name "Name";
          foaf:knows <https://example.com/profile/card#me>, <https://example.org/profile/card#i>.

        <#i> a foaf:Person; foaf:name "myname".
        `,
        mimeType: "text/turtle",
      },
      {
        slug: "person2",
        isContainer: false,
        data: `
        @prefix foaf: <http://xmlns.com/foaf/0.1/>.
        <#me> a foaf:Person; foaf:name "Other Name"; foaf:knows <./person#me>.
        `,
        mimeType: "text/turtle",
      },
    ],
  });

  beforeEach(() => {
    methods = createBrowserSolidVueComposables();
  });

  beforeEach(() => {
    Object.defineProperty(globalThis, "SharedWorker", {
      value: MockSharedWorker,
      writable: true,
      configurable: true,
    });
  });

  describe("useSolidAuth", () => {
    it("should provide a reactive auth session", async () => {
      const [, childResult, app] = withParentChildSetup(
        () => methods.provideSolidLdo(),
        () => methods.useSolidAuth(),
      );

      expect(childResult.fetch).toBeTypeOf("function");
      expect(childResult.session.value.isActive).toBeTypeOf("boolean");

      app.unmount();
    });

    it("should throw error when the session is not provided", async () => {
      expect(() => {
        withParentChildSetup(
          () => {},
          () => methods.useSolidAuth(),
        );
      }).toThrow();
    });
  });

  describe("useRootContainerFor", () => {
    let childResult: Ref<SolidContainer | undefined>,
      // parentResult: {
      //   dataset: ConnectedLdoDataset<SolidConnectedPlugin[]>;
      //   solidAuth: SolidAuthSession;
      // },
      app: ReturnType<CreateAppFunction<Element>>,
      uri: Ref<SolidLeafUri | SolidContainerUri | undefined>,
      options: Ref<UseResourceOptions<"solid">>;

    beforeEach(() => {
      uri = ref<SolidLeafUri | SolidContainerUri | undefined>();
      options = ref({});

      [, /*parentResult*/ childResult, app] = withParentChildSetup(
        () => methods.provideSolidLdo(),
        () => methods.useRootContainerFor(uri, options),
      );
    });

    afterEach(() => {
      app.unmount();
    });

    it("should return reactive root container on success", async () => {
      uri.value = person2ResourceUri;

      await vi.waitFor(() => {
        expect(childResult.value?.uri).toEqual("http://localhost:3006/");
      });
    });

    it("should return undefined when URI input changes to undefined", async () => {
      uri.value = person2ResourceUri;

      await vi.waitFor(() => {
        expect(childResult.value?.uri).toEqual("http://localhost:3006/");
      });

      uri.value = undefined;

      await vi.waitFor(() => {
        expect(childResult.value?.uri).toEqual(undefined);
      });
    });

    it("should return undefined on failure", async () => {
      uri.value = person2ResourceUri;

      await vi.waitFor(() => {
        expect(childResult.value?.uri).toEqual("http://localhost:3006/");
      });

      uri.value = "https://some.example";

      await vi.waitFor(() => {
        expect(childResult.value?.uri).toEqual(undefined);
      });
    });

    it("should update result to temporary undefined immediately after URI changes", async () => {
      uri.value = personResourceUri;

      await vi.waitFor(() => {
        expect(childResult.value?.uri).toEqual("http://localhost:3006/");
      });

      uri.value = person2ResourceUri;

      // first the result should clear
      await nextTick();
      expect(childResult.value?.uri).toEqual(undefined);

      await vi.waitFor(() => {
        expect(childResult.value?.uri).toEqual("http://localhost:3006/");
      });
    });
  });

  describe("useResource reacting to auth session", () => {
    it("should return reactive resource and refetch it if authentication state changes", async () => {
      const uri = ref(personResourceUri);

      const [parentResult, childResult, app] = withParentChildSetup(
        () => methods.provideSolidLdo(),
        () => methods.useResource(uri),
      );

      // fetches once
      await vi.waitFor(() => {
        expect(childResult.value.isLoading()).toEqual(true);
      });
      await vi.waitFor(() => {
        expect(childResult.value.isLoading()).toEqual(false);
      });

      // session.isActive changes
      parentResult.solidAuth.session.value = {
        isActive: true,
      } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      // fetches again
      await vi.waitFor(() => {
        expect(childResult.value.isLoading()).toEqual(true);
      });
      await vi.waitFor(() => {
        expect(childResult.value.isLoading()).toEqual(false);
      });

      app.unmount();
    });
  });
});
