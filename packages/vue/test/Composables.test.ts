import { describe, it, beforeEach, expect, vi } from "vitest";
import {
  createLdoVueMethods,
  createUseMatchObject,
  createUseResource,
  createUseSubscribeToResource,
  type UseResourceOptions,
} from "../src/index";
import {
  type SolidConnectedPlugin,
  solidConnectedPlugin,
  type SolidContainerUri,
  type SolidLeafUri,
} from "@ldo/connected-solid";
import { RerenderCount, waitForResource, withSetup } from "./test-utils";
import assert from "node:assert";
import { setupServer } from "@ldo/test-solid-server";
import { nextTick, type Ref, ref } from "vue";
import { FoafProfileShapeType } from "./_ldo/foafProfile.shapeTypes";
import { BasicLdSet } from "@ldo/jsonld-dataset-proxy";
import { literal, namedNode, quad } from "@ldo/rdf-utils";
import {
  ConnectedLdoTransactionDataset,
  createConnectedLdoDataset,
  type IConnectedLdoDataset,
} from "@ldo/connected";

// Only overwrite this if we are in test mode. This is an env var we happen to have in our repo
if (process.env.VITE_IS_TEST === "true") {
  class ESBuildAndJSDOMCompatibleTextEncoder extends TextEncoder {
    constructor() {
      super();
    }

    encode(input: string) {
      if (typeof input !== "string") {
        throw new TypeError("`input` must be a string");
      }

      const decodedURI = decodeURIComponent(encodeURIComponent(input));
      const arr = new Uint8Array(decodedURI.length);
      const chars = decodedURI.split("");
      for (let i = 0; i < chars.length; i++) {
        arr[i] = decodedURI[i].charCodeAt(0);
      }
      return arr;
    }
  }

  Object.defineProperty(global, "TextEncoder", {
    value: ESBuildAndJSDOMCompatibleTextEncoder,
    writable: true,
  });
}

describe("LDO Vue Composables", () => {
  let methods: ReturnType<typeof createLdoVueMethods<[SolidConnectedPlugin]>>;
  const personResourceUri = "http://localhost:3006/directory/person";
  const personUri = personResourceUri + "#me";
  const otherPersonUri = personResourceUri + "#i";
  const person2ResourceUri = "http://localhost:3006/directory/person2";
  const person2Uri = person2ResourceUri + "#me";
  const foafName = namedNode("http://xmlns.com/foaf/0.1/name");
  const foafKnows = namedNode("http://xmlns.com/foaf/0.1/knows");

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
    methods = createLdoVueMethods([solidConnectedPlugin]);
    methods.dataset.setContext("solid", { fetch: s.fetchMock });
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

      await waitForResource(result.value);

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

      await waitForResource(result.value);

      expect(result.value.isFetched()).toBe(true);
      expect(result.value.type).toEqual("SolidContainer");

      uriRef.value = "http://localhost:3006/directory/leaf";
      await nextTick();

      expect(result.value.isFetched()).toBe(false);
      expect(result.value.uri).toEqual("http://localhost:3006/directory/leaf");

      await waitForResource(result.value);

      expect(result.value.isFetched()).toBe(true);
      expect(result.value.type).toEqual("SolidLeaf");

      app.unmount();
    });

    it("should handle change in options", async () => {
      // s.fetchMock.mockClear();

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

      await waitForResource(result.value);

      expect(result.value.isFetched()).toBe(true);

      expect(s.fetchMock).toHaveBeenCalledTimes(1);

      app.unmount();
    });
  });

  describe("useSubject", () => {
    it("should return a linked data object with given subject uri", async () => {
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

      const rerenderCount = new RerenderCount(result);

      expect(rerenderCount.count).toEqual(0);

      await waitForResource(result[1].value);

      expect(rerenderCount.count).toEqual(1);

      assert(!result[1].value.isError);
      expect(result[1].value.isAbsent()).toBe(false);

      expect(result[0].value.name).toEqual("Name");
      const knows = result[0].value.knows?.map((k) => k["@id"]);
      expect(knows).toHaveLength(2);
      expect(knows).toContain("https://example.com/profile/card#me");
      expect(knows).toContain("https://example.org/profile/card#i");

      app.unmount();
    });

    it("should change the LDO when the subject changes", async () => {
      // s.fetchMock.mockClear();

      const subject = ref("http://localhost:3006/directory/person#me");

      expect(s.fetchMock).toHaveBeenCalledTimes(0);

      const [result, app] = withSetup(() => {
        const useSubjectResult = methods.useSubject(
          FoafProfileShapeType,
          subject,
        );

        const useResourceResult = methods.useResource(
          subject as Ref<SolidLeafUri, SolidLeafUri>,
        );

        return [useSubjectResult, useResourceResult] as const;
      });

      const rerenderCount = new RerenderCount(result[0]);

      // inform the tracking proxy we're interested in this and check the result
      // removing access to the property will lead to less renders
      expect(result[0].value.name).toEqual(undefined);

      expect(rerenderCount.count).toEqual(0);

      await waitForResource(result[1].value);

      expect(result[0].value.name).toEqual("Name");
      expect(rerenderCount.count).toEqual(1);

      subject.value = "http://localhost:3006/directory/person#i";

      // this should not trigger refetch
      await nextTick();

      expect(result[1].value.isFetched()).toBe(true);
      expect(rerenderCount.count).toEqual(2);
      expect(result[0].value.name).toEqual("myname");

      subject.value = "http://localhost:3006/directory/person2#me";

      // this triggers refetch
      await nextTick();
      expect(result[1].value.isFetched()).toBe(false);
      expect(result[0].value.name).toEqual(undefined);
      expect(rerenderCount.count).toEqual(3);

      await waitForResource(result[1].value);

      expect(result[1].value.isFetched()).toBe(true);
      expect(result[1].value.isAbsent()).toBe(false);
      expect(result[0].value.name).toEqual("Other Name");
      expect(rerenderCount.count).toEqual(4);

      app.unmount();
    });

    it.todo(
      "should change the LDO when the shape type changes (this will probably ruin types though)",
    );
    it.todo("should change the LDO when the options.dataset changes");
  });

  describe("useMatchSubject", () => {
    it("should return a LdSet of matched linked data objects", async () => {
      const [result, app] = withSetup(() => {
        const useMatchSubjectResult = methods.useMatchSubject(
          FoafProfileShapeType,
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          "http://xmlns.com/foaf/0.1/Person",
        );
        const useResourceResult = methods.useResource(
          "http://localhost:3006/directory/person",
        );

        return [useMatchSubjectResult, useResourceResult] as const;
      });

      await waitForResource(result[1].value);

      assert(!result[1].value.isError);
      expect(result[1].value.isAbsent()).toBe(false);

      expect(result[0].value).toBeInstanceOf(BasicLdSet);
      expect(result[0].value.size).toBe(2);
      expect(result[0].value.map((v) => v["@id"])).toContain(
        "http://localhost:3006/directory/person#me",
      );
      expect(result[0].value.map((v) => v["@id"])).toContain(
        "http://localhost:3006/directory/person#i",
      );

      app.unmount();
    });
    it.todo(
      "should change the LDO set when the shape type changes (this will probably ruin types though)",
    );
    it.todo("should change the LDO set when the options.dataset changes");
    it.todo("should change the LDO set when predicate changes");

    it("should change the LDO set when object changes", async () => {
      const object = ref("http://xmlns.com/foaf/0.1/Person");

      const [result, app] = withSetup(() => {
        const useMatchSubjectResult = methods.useMatchSubject(
          FoafProfileShapeType,
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          object,
          undefined,
        );
        const useResourceResult = methods.useResource(
          "http://localhost:3006/directory/person",
        );

        return [useMatchSubjectResult, useResourceResult] as const;
      });

      const rerenderCount = new RerenderCount(result);

      expect(result[0].value.size).toBe(0);

      await waitForResource(result[1].value);

      expect(rerenderCount.count).toBe(2);

      assert(!result[1].value.isError);
      expect(result[1].value.isAbsent()).toBe(false);

      expect(result[0].value).toBeInstanceOf(BasicLdSet);
      expect(result[0].value.size).toBe(2);
      expect(result[0].value.map((v) => v["@id"])).toContain(
        "http://localhost:3006/directory/person#me",
      );
      expect(result[0].value.map((v) => v["@id"])).toContain(
        "http://localhost:3006/directory/person#i",
      );

      object.value = "http://xmlns.com/foaf/0.1/PersonalProfileDocument";
      await nextTick();
      expect(result[0].value.size).toBe(1);

      result[0].value.forEach((v) => {
        expect(v["@id"]).toBe("http://localhost:3006/directory/person");
      });

      // TODO fix, it does update in production though
      expect(rerenderCount.count).toBe(3);

      app.unmount();
    });

    it.todo("should change the LDO set when graph changes");
  });

  describe("useMatchObject", () => {
    it("should return a LdSet of matched linked data objects", async () => {
      const [result, app] = withSetup(() => {
        const useMatchObjectResult = methods.useMatchObject(
          FoafProfileShapeType,
          "http://localhost:3006/directory/person#me",
          "http://xmlns.com/foaf/0.1/knows",
          "http://localhost:3006/directory/person",
        );
        const useResourceResult = methods.useResource(
          "http://localhost:3006/directory/person",
        );

        return [useMatchObjectResult, useResourceResult] as const;
      });

      await waitForResource(result[1].value);

      assert(!result[1].value.isError);
      expect(result[1].value.isAbsent()).toBe(false);

      const friends = result[0].value;
      expect(friends.size).toBe(2);
      expect(friends.map((v) => v["@id"])).toContain(
        "https://example.com/profile/card#me",
      );
      expect(friends.map((v) => v["@id"])).toContain(
        "https://example.org/profile/card#i",
      );

      app.unmount();
    });

    it.todo("should change the LDO set when the shape type changes");
    it.todo("should change the LDO set when the options.dataset changes");
    it.todo("should change the LDO set when subject changes");
    it.todo("should change the LDO set when predicate changes");
    it.todo("should change the LDO set when graph changes");
  });

  describe("useSubscribeToResource", () => {
    it("should subscribe to resource changes (detect resource changes)", async () => {
      // subscribe
      const [result, app] = withSetup(
        () =>
          [
            methods.useSubscribeToResource([personResourceUri]),
            methods.useSubject(FoafProfileShapeType, personUri),
          ] as const,
      );

      void result[1].value.name;
      const rerenderCount = new RerenderCount(result[1]);

      // change the resource
      const resource = methods.dataset.getResource(personResourceUri);

      await vi.waitFor(() => {
        expect(resource.isFetched()).toBe(true);
      });
      await vi.waitFor(() => {
        expect(resource.isSubscribedToNotifications()).toBe(true);
      });
      // check that the change has been detected
      rerenderCount.clearCount();
      const changeResult = await s.authFetch(personResourceUri, {
        method: "PATCH",
        headers: { "content-type": "text/n3" },
        body: `
          @prefix solid: <http://www.w3.org/ns/solid/terms#>.
          @prefix foaf: <http://xmlns.com/foaf/0.1/>.

          _:patch a solid:InsertDeletePatch;
          solid:inserts { <#me> foaf:name "NEW NAME". };
          solid:deletes { <#me> foaf:name ?name. };
          solid:where { <#me> foaf:name ?name. }.`,
      });
      expect(changeResult.ok).toBe(true);
      await nextTick();
      // refetch should be going on
      await vi.waitFor(() => {
        expect(resource.isLoading()).toBe(true);
      });
      // and then done
      await vi.waitFor(() => expect(resource.isLoading()).toBe(false));
      expect(resource.isError).toBe(false);
      // and expect refreshed data
      expect(result[1].value.name).toEqual("NEW NAME");
      await nextTick();
      // expect(rerenderCount.count).toEqual(1);

      app.unmount();
    });

    it("should unsubscribe from resources removed", async () => {
      const urlRef = ref<string[]>([personResourceUri]);
      // subscribe
      const [, app] = withSetup(
        () =>
          [
            methods.useSubscribeToResource(urlRef),
            methods.useSubject(FoafProfileShapeType, personUri),
          ] as const,
      );

      const resource = methods.dataset.getResource(personResourceUri);
      await vi.waitFor(() => {
        expect(resource.isFetched()).toBe(true);
      });
      await vi.waitFor(() => {
        expect(resource.isSubscribedToNotifications()).toBe(true);
      });

      // remove resource from subscription
      urlRef.value = [];

      // and check that it's not subscribed, eventually
      await vi.waitFor(() => {
        expect(resource.isSubscribedToNotifications()).toBe(false);
      });

      app.unmount();
    });

    it("should unsubscribe from resources when finished", async () => {
      // subscribe
      const [, app] = withSetup(
        () =>
          [
            methods.useSubscribeToResource([personResourceUri]),
            methods.useSubject(FoafProfileShapeType, personUri),
          ] as const,
      );

      const resource = methods.dataset.getResource(personResourceUri);
      await vi.waitFor(() => {
        expect(resource.isFetched()).toBe(true);
      });
      await vi.waitFor(() => {
        expect(resource.isSubscribedToNotifications()).toBe(true);
      });

      // unmount
      app.unmount();

      // and check that the resource is not subscribed, eventually
      await vi.waitFor(() => {
        expect(resource.isSubscribedToNotifications()).toBe(false);
      });
    });
  });

  describe("useLinkQuery", () => {
    it("should resolve the query", async () => {
      const [result, app] = withSetup(() =>
        methods.useLinkQuery(
          FoafProfileShapeType,
          person2ResourceUri,
          person2Uri,
          { name: true, knows: { name: true, "@id": true } },
        ),
      );

      const person2Resource = methods.dataset.getResource(person2ResourceUri);
      const personResource = methods.dataset.getResource(personResourceUri);

      await vi.waitFor(() => {
        expect(person2Resource.isFetched()).toBe(true);
        expect(personResource.isFetched()).toBe(true);
      });

      // test result
      expect(result.value.knows?.map((k) => k.name)).toEqual(["Name"]);

      // wait for resources to be subscribed to notifications
      await vi.waitFor(() => {
        expect(person2Resource.isSubscribedToNotifications()).toBe(true);
        expect(personResource.isSubscribedToNotifications()).toBe(true);
      });

      app.unmount();

      // wait for the resources to be unsubscribed from notifications after unmount
      await vi.waitFor(() => {
        expect(person2Resource.isSubscribedToNotifications()).toBe(false);
        expect(personResource.isSubscribedToNotifications()).toBe(false);
      });
    });
    it.todo("should update the query when a resource changes");
  });

  describe("useChangeDataset", () => {
    it("should accept and commit changes to a default dataset", async () => {
      const [results, app] = withSetup(() => {
        const changeDataset = methods.useChangeDataset();
        const resource = methods.useResource(personResourceUri);
        methods.useSubscribeToResource([personResourceUri]);

        return { changeDataset, resource };
      });

      expect(results.changeDataset.transactionDataset.value).toBeInstanceOf(
        ConnectedLdoTransactionDataset,
      );

      // make sure the resource is fetched before proceeding
      await vi.waitFor(() => {
        expect(results.resource.value.isFetched()).toBe(true);
      });
      // make sure resource will update
      await vi.waitFor(() => {
        expect(results.resource.value.isSubscribedToNotifications()).toBe(true);
      });

      // change person's name
      results.changeDataset.setData((dataset) => {
        dataset.deleteMatches(namedNode(personUri), foafName);
        dataset.add(
          quad(
            namedNode(personUri),
            foafName,
            literal("New Saved Name"),
            namedNode(personResourceUri),
          ),
        );
      });

      expect(
        results.changeDataset.transactionDataset.value.getChanges().added?.size,
      ).toEqual(1);
      expect(
        results.changeDataset.transactionDataset.value.getChanges().removed
          ?.size,
      ).toEqual(1);
      const result = await results.changeDataset.commitData();
      expect(result.isError).toBe(false);
      // transaction dataset should be reset at this point
      expect(
        results.changeDataset.transactionDataset.value.getChanges(),
      ).toEqual({});

      // the resource should reload (thanks to subscription)
      await vi.waitFor(() => {
        expect(results.resource.value.isLoading()).toBe(true);
      });
      await vi.waitFor(() => {
        expect(results.resource.value.isLoading()).toBe(false);
      });

      const names = methods.dataset.match(namedNode(personUri), foafName);

      // and the name should be updated
      expect(names.size).toBe(1);
      expect(names.toArray()[0].object.value).toBe("New Saved Name");

      app.unmount();

      // let's just wait for unsubscribing at the end
      await vi.waitFor(() => {
        expect(results.resource.value.isLoading()).toBe(false);
      });
    });

    it.todo("should handle changes to custom dataset");
    it.todo("should handle error in saving");
  });

  describe("useChangeSubject", () => {
    it("should accept and commit changes to a default dataset", async () => {
      const [{ changeDataset, resource, subject, otherSubject }, app] =
        withSetup(() => {
          const changeDataset = methods.useChangeSubject(
            FoafProfileShapeType,
            personUri,
          );
          const resource = methods.useResource(personResourceUri);
          const subject = methods.useSubject(FoafProfileShapeType, personUri);
          const otherSubject = methods.useSubject(
            FoafProfileShapeType,
            otherPersonUri,
          );
          return { changeDataset, resource, subject, otherSubject };
        });

      await vi.waitFor(() => {
        expect(resource.value.isFetched()).toBe(true);
      });

      changeDataset.setData(resource.value, (profile) => {
        profile.name = "ANOTHER NAME";
      });
      changeDataset.setData(
        resource.value,
        (profile) => {
          profile.name = "OTHER PERSON NAME";
        },
        otherSubject.value,
      );

      const result = await changeDataset.commitData();
      expect(result.isError).toBe(false);
      expect(subject.value.name).toEqual("ANOTHER NAME");
      expect(otherSubject.value.name).toEqual("OTHER PERSON NAME");

      app.unmount();
    });

    it.todo("should accept and commit changes to a custom dataset");
    it.todo("should handle error in saving");
  });

  describe("useChangeMatchObject", () => {
    it("should accept and commit changes to a default dataset", async () => {
      const [{ changeDataset, resource, resource2, objects, subject }, app] =
        withSetup(() => {
          const changeDataset = methods.useChangeMatchObject(
            FoafProfileShapeType,
            person2Uri,
            foafKnows,
          );
          const resource = methods.useResource(personResourceUri);
          const resource2 = methods.useResource(person2ResourceUri);
          const subject = methods.useSubject(FoafProfileShapeType, person2Uri);
          const objects = methods.useMatchObject(
            FoafProfileShapeType,
            person2Uri,
            foafKnows,
          );
          methods.useSubscribeToResource([
            personResourceUri,
            person2ResourceUri,
          ]);
          return { changeDataset, resource, resource2, objects, subject };
        });

      await vi.waitFor(() => {
        expect(resource.value.isFetched()).toBe(true);
        expect(resource2.value.isFetched()).toBe(true);
      });
      await vi.waitFor(() => {
        expect(resource.value.isSubscribedToNotifications()).toBe(true);
        expect(resource2.value.isSubscribedToNotifications()).toBe(true);
      });

      changeDataset.setData(resource.value, (friends) => {
        expect(friends.size).toEqual(1);
        friends.forEach((person) => {
          person.name = "ANOTHER NAME";
        });
      });

      // we can also edit other subjects and graphs (resources) within the same transaction
      changeDataset.setData(
        resource2.value,
        (person) => {
          person.name = "PERSON 2 NAME";
        },
        subject.value,
      );

      const result = await changeDataset.commitData();
      expect(result.isError).toBe(false);

      await vi.waitFor(() => {
        expect(resource.value.isLoading()).toBe(true);
        expect(resource2.value.isLoading()).toBe(true);
      });
      await vi.waitFor(() => {
        expect(resource.value.isLoading()).toBe(false);
        expect(resource2.value.isLoading()).toBe(false);
      });

      expect(objects.value.size).toBe(1);
      expect(objects.value.toArray()[0].name).toEqual("ANOTHER NAME");
      expect(subject.value.name).toEqual("PERSON 2 NAME");

      app.unmount();
      await vi.waitFor(() => {
        expect(resource.value.isSubscribedToNotifications()).toBe(false);
        expect(resource2.value.isSubscribedToNotifications()).toBe(false);
      });
    });

    it("should accept and commit changes to a custom dataset", async () => {
      const otherDataset = createConnectedLdoDataset([
        solidConnectedPlugin,
      ]) as IConnectedLdoDataset<[SolidConnectedPlugin]>;
      otherDataset.setContext("solid", { fetch: s.fetchMock });
      const useResource = createUseResource(otherDataset);
      const useMatchObject = createUseMatchObject(otherDataset);
      const useSubscribeToResource = createUseSubscribeToResource(otherDataset);
      const [{ changeDataset, resource, resource2, objects }, app] = withSetup(
        () => {
          const changeDataset = methods.useChangeMatchObject(
            FoafProfileShapeType,
            person2Uri,
            foafKnows,
            undefined,
            {
              dataset: otherDataset as IConnectedLdoDataset<
                [SolidConnectedPlugin]
              >,
            },
          );
          const resource = useResource(personResourceUri);
          const resource2 = useResource(person2ResourceUri);
          const objects = useMatchObject(
            FoafProfileShapeType,
            person2Uri,
            foafKnows,
          );
          useSubscribeToResource([personResourceUri, person2ResourceUri]);
          return { changeDataset, resource, resource2, objects };
        },
      );

      await vi.waitFor(() => {
        expect(resource.value.isFetched()).toBe(true);
        expect(resource2.value.isFetched()).toBe(true);
      });
      await vi.waitFor(() => {
        expect(resource.value.isSubscribedToNotifications()).toBe(true);
        expect(resource2.value.isSubscribedToNotifications()).toBe(true);
      });

      changeDataset.setData(resource.value, (friends) => {
        friends.forEach((person) => {
          person.name = "ANOTHER NAME";
        });
      });

      const result = await changeDataset.commitData();
      expect(result.isError).toBe(false);
      console.log(result);

      await vi.waitFor(() => {
        expect(resource.value.isLoading()).toBe(true);
      });
      await vi.waitFor(() => {
        expect(resource.value.isLoading()).toBe(false);
      });

      expect(objects.value.size).toBe(1);
      expect(objects.value.toArray()[0].name).toEqual("ANOTHER NAME");

      app.unmount();
      await vi.waitFor(() => {
        expect(resource.value.isSubscribedToNotifications()).toBe(false);
        expect(resource2.value.isSubscribedToNotifications()).toBe(false);
      });
    });

    it.todo("should handle error in saving");
  });

  describe("useChangeMatchSubject", () => {
    it("should accept and commit changes to a default dataset", async () => {
      const [{ changeDataset, resource, resource2, subjects, subject2 }, app] =
        withSetup(() => {
          // people in first resource who have friends
          const changeDataset = methods.useChangeMatchSubject(
            FoafProfileShapeType,
            foafKnows,
            undefined,
            namedNode(personResourceUri),
          );
          const resource = methods.useResource(personResourceUri);
          const resource2 = methods.useResource(person2ResourceUri);
          const subject2 = methods.useSubject(FoafProfileShapeType, person2Uri);
          const subjects = methods.useMatchSubject(
            FoafProfileShapeType,
            foafKnows,
            undefined,
            namedNode(personResourceUri),
          );
          methods.useSubscribeToResource([
            personResourceUri,
            person2ResourceUri,
          ]);
          return {
            changeDataset,
            resource,
            resource2,
            subjects,
            subject2,
          };
        });

      await vi.waitFor(() => {
        expect(resource.value.isFetched()).toBe(true);
        expect(resource2.value.isFetched()).toBe(true);
      });
      await vi.waitFor(() => {
        expect(resource.value.isSubscribedToNotifications()).toBe(true);
        expect(resource2.value.isSubscribedToNotifications()).toBe(true);
      });

      changeDataset.setData(resource.value, (people) => {
        // expect(people.size).toEqual(1); // weirdly, this fails! TODO
        let count = 0;
        people.forEach((person) => {
          count++;
          person.name = "ANOTHER NAME";
        });
        expect(count).toBe(1);
      });

      // we can also edit other subjects and graphs (resources) within the same transaction
      changeDataset.setData(
        resource2.value,
        (person) => {
          person.name = "PERSON 2 NAME";
        },
        subject2.value,
      );

      const result = await changeDataset.commitData();
      expect(result.isError).toBe(false);

      await vi.waitFor(() => {
        expect(resource.value.isLoading()).toBe(true);
        expect(resource2.value.isLoading()).toBe(true);
      });
      await vi.waitFor(() => {
        expect(resource.value.isLoading()).toBe(false);
        expect(resource2.value.isLoading()).toBe(false);
      });

      // expect(subjects.value.size).toBe(1); // TODO weirdly, this fails
      expect(subjects.value.toArray()).toHaveLength(1);
      expect(subjects.value.toArray()[0].name).toEqual("ANOTHER NAME");
      expect(subject2.value.name).toEqual("PERSON 2 NAME");

      app.unmount();
      await vi.waitFor(() => {
        expect(resource.value.isSubscribedToNotifications()).toBe(false);
        expect(resource2.value.isSubscribedToNotifications()).toBe(false);
      });
    });

    it.todo("should accept and commit changes to a custom dataset");
    it.todo("should handle error in saving");
  });
});
