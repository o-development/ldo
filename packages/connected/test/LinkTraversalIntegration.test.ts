import type { ConnectedLdoDataset } from "../src/ConnectedLdoDataset";
import {
  // changeData,
  // commitData,
  createConnectedLdoDataset,
} from "../src/index";
import {
  solidConnectedPlugin,
  type SolidConnectedPlugin,
} from "@ldo/connected-solid";
import { setupServer } from "@ldo/test-solid-server";
import {
  linkTraversalData,
  MAIN_PROFILE_SUBJECT,
  MAIN_PROFILE_URI,
  OTHER_PROFILE_URI,
  THIRD_PROFILE_SUBJECT,
  THIRD_PROFILE_URI,
} from "./LinkTraversalData";
// import { Person } from "./_ldo/solidProfile.shapeTypes";
import { wait } from "./util/wait";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Person } from "./Person";
import { dataFactory } from "@ldo/ldo";
import { namedNode } from "@ldo/rdf-utils";

describe("Link Traversal", () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let solidLdoDataset: ConnectedLdoDataset<SolidConnectedPlugin[]>;

  const s = setupServer(3005, linkTraversalData);

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    solidLdoDataset = createConnectedLdoDataset([solidConnectedPlugin]);
    solidLdoDataset.setContext("solid", { fetch: s.fetchMock });
  });

  it("does a simple run to traverse data", async () => {
    const mainProfileResource = solidLdoDataset.getResource(MAIN_PROFILE_URI);

    const data = await solidLdoDataset
      .usingType(Person)
      .startLinkQuery(mainProfileResource, MAIN_PROFILE_SUBJECT, {
        name: true,
        // knows: { value: true },
        knows: { name: true },
      })
      .run();

    const resourceUris = solidLdoDataset
      .getResources()
      .map((resource) => resource.uri);
    expect(resourceUris.length).toBe(3);
    expect(resourceUris).toContain(MAIN_PROFILE_URI);
    expect(resourceUris).toContain(OTHER_PROFILE_URI);
    expect(data.name).toBe("Main User");
    expect(Array.from(data.knows)[0].name).toBe("Other User");
  });

  it("handles subscriptions if data changes locally", async () => {
    const mainProfileResource = solidLdoDataset.getResource(MAIN_PROFILE_URI);
    const linkQuery = solidLdoDataset
      .usingType(Person)
      .startLinkQuery(mainProfileResource, MAIN_PROFILE_SUBJECT, {
        name: true,
        knows: {
          name: true,
        },
      });
    const subscriptionId = await linkQuery.subscribe();

    // Should have regular information
    let mainProfile = solidLdoDataset
      .usingType(Person)
      .fromSubject(MAIN_PROFILE_SUBJECT);
    let resourceUris = solidLdoDataset
      .getResources()
      .map((resource) => resource.uri);
    expect(resourceUris.length).toBe(3);
    expect(resourceUris).toContain(MAIN_PROFILE_URI);
    expect(resourceUris).toContain(OTHER_PROFILE_URI);
    expect(mainProfile.name).toBe("Main User");
    expect(mainProfile.knows?.size).toBe(1);
    expect(Array.from(mainProfile.knows)[0].name).toBe("Other User");

    const transactionDataset = solidLdoDataset.startTransaction();

    const cMainProfile = transactionDataset
      .usingType(Person)
      .write(mainProfileResource.uri)
      .fromSubject(mainProfile.value);

    cMainProfile.knows?.add(namedNode(THIRD_PROFILE_SUBJECT) as Person);

    transactionDataset.commit();

    // Update to include a new document
    // const cMainProfile = changeData(mainProfile, mainProfileResource);
    // cMainProfile.knows?.add(
    //   new Person(THIRD_PROFILE_SUBJECT, mainProfile.dataset, dataFactory),
    // );
    // await commitData(cMainProfile);

    // Wait for 200ms to allow the other file to be fetched
    await wait(200);

    // After the data is committed, the third profile should be present
    mainProfile = solidLdoDataset
      .usingType(Person)
      .fromSubject(MAIN_PROFILE_SUBJECT);

    vi.waitFor(() => {
      expect(solidLdoDataset.getResources()).toHaveLength(4);
    });

    resourceUris = solidLdoDataset
      .getResources()
      .map((resource) => resource.uri);
    expect(resourceUris.length).toBe(4);
    expect(resourceUris).toContain(MAIN_PROFILE_URI);
    expect(resourceUris).toContain(OTHER_PROFILE_URI);
    expect(resourceUris).toContain(THIRD_PROFILE_URI);
    expect(mainProfile.name).toBe("Main User");
    expect(mainProfile.knows?.size).toBe(2);
    const knowNames = Array.from(mainProfile.knows).map(
      (knowsPerson) => knowsPerson.name,
    );
    expect(knowNames).toContain("Other User");
    expect(knowNames).toContain("Third User");

    // Unsubscribe
    await linkQuery.unsubscribe(subscriptionId);
  });

  it("handles subscriptions if data changes on the Pod", async () => {
    const mainProfileResource = solidLdoDataset.getResource(MAIN_PROFILE_URI);
    const linkQuery = solidLdoDataset
      .usingType(Person)
      .startLinkQuery(mainProfileResource, MAIN_PROFILE_SUBJECT, {
        name: true,
        knows: {
          name: true,
        },
      });

    const unsubscribeId = await linkQuery.subscribe();

    // Should have regular information
    let mainProfile = solidLdoDataset
      .usingType(Person)
      .fromSubject(MAIN_PROFILE_SUBJECT);
    let resourceUris = solidLdoDataset
      .getResources()
      .map((resource) => resource.uri);
    expect(resourceUris.length).toBe(3);
    expect(resourceUris).toContain(MAIN_PROFILE_URI);
    expect(resourceUris).toContain(OTHER_PROFILE_URI);
    expect(mainProfile.name).toBe("Main User");
    expect(mainProfile.knows?.size).toBe(1);
    expect(Array.from(mainProfile.knows)[0].name).toBe("Other User");

    let subscribedResources = linkQuery
      .getSubscribedResources()
      .map((resource) => resource.uri);
    expect(subscribedResources.length).toBe(2);
    expect(subscribedResources).toContain(MAIN_PROFILE_URI);
    expect(subscribedResources).toContain(OTHER_PROFILE_URI);

    // Update data on the Pod
    await s.authFetch(MAIN_PROFILE_URI, {
      method: "PATCH",
      body: "INSERT DATA { <http://localhost:3005/test-container/mainProfile.ttl#me> <http://xmlns.com/foaf/0.1/knows> <http://localhost:3005/test-container/thirdProfile.ttl#me> . }",
      headers: {
        "Content-Type": "application/sparql-update",
      },
    });
    await wait(1000);

    // After the data is committed, the third profile should be present
    mainProfile = solidLdoDataset
      .usingType(Person)
      .fromSubject(MAIN_PROFILE_SUBJECT);
    resourceUris = solidLdoDataset
      .getResources()
      .map((resource) => resource.uri);
    expect(resourceUris.length).toBe(4);
    expect(resourceUris).toContain(MAIN_PROFILE_URI);
    expect(resourceUris).toContain(OTHER_PROFILE_URI);
    expect(resourceUris).toContain(THIRD_PROFILE_URI);
    expect(mainProfile.name).toBe("Main User");
    expect(mainProfile.knows?.size).toBe(2);
    const knowNames = Array.from(mainProfile.knows).map(
      (knowsPerson) => knowsPerson.name,
    );
    expect(knowNames).toContain("Other User");
    expect(knowNames).toContain("Third User");

    subscribedResources = linkQuery
      .getSubscribedResources()
      .map((resource) => resource.uri);
    expect(subscribedResources.length).toBe(3);
    expect(subscribedResources).toContain(MAIN_PROFILE_URI);
    expect(subscribedResources).toContain(OTHER_PROFILE_URI);
    expect(subscribedResources).toContain(THIRD_PROFILE_URI);

    // Unsubscribe
    await linkQuery.unsubscribe(unsubscribeId);

    await wait(200);

    s.fetchMock.mockClear();

    // Does not update when unsubscribed
    await s.authFetch(MAIN_PROFILE_URI, {
      method: "PATCH",
      body: "INSERT DATA { <http://localhost:3005/test-container/mainProfile.ttl#me> <http://xmlns.com/foaf/0.1/knows> <http://localhost:3005/test-container/fourthProfile.ttl#me> . }",
      headers: {
        "Content-Type": "application/sparql-update",
      },
    });
    await wait(1000);

    expect(s.fetchMock).not.toHaveBeenCalled();
    subscribedResources = linkQuery
      .getSubscribedResources()
      .map((resource) => resource.uri);
    expect(subscribedResources.length).toBe(0);

    // Check that all resources are unsubscribed from notifications
    const resources = solidLdoDataset.getResources();
    resources.forEach((resource) => {
      expect(resource.isSubscribedToNotifications()).toBe(false);
    });

    const transactionDataset = solidLdoDataset.startTransaction();

    const cMainProfile = transactionDataset
      .usingType(Person)
      .write(mainProfileResource.uri)
      .fromSubject(mainProfile.value);

    // const cMainProfile = changeData(mainProfile, mainProfileResource);
    cMainProfile.knows?.add(
      namedNode(
        "http://localhost:3005/test-container/fifthProfile.ttl#me",
      ) as Person,
    );

    const result = await transactionDataset.commitToRemote();

    expect(result.isError).toBe(false);
  });
});
