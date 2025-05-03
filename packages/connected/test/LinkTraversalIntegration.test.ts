import type { ConnectedLdoDataset } from "../src/ConnectedLdoDataset";
import { changeData, commitData, createConnectedLdoDataset } from "../src";
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
import { SolidProfileShapeShapeType } from "./.ldo/solidProfile.shapeTypes";
import { wait } from "./util/wait";

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
      .usingType(SolidProfileShapeShapeType)
      .startLinkQuery(mainProfileResource, MAIN_PROFILE_SUBJECT, {
        name: true,
        knows: {
          name: true,
        },
      })
      .run();
    const resourceUris = solidLdoDataset
      .getResources()
      .map((resource) => resource.uri);
    expect(resourceUris.length).toBe(3);
    expect(resourceUris).toContain(MAIN_PROFILE_URI);
    expect(resourceUris).toContain(OTHER_PROFILE_URI);
    expect(data.name).toBe("Main User");
    expect(data.knows?.toArray()[0].name).toBe("Other User");
  });

  it("handles subscriptions if data changes locally", async () => {
    const mainProfileResource = solidLdoDataset.getResource(MAIN_PROFILE_URI);
    await solidLdoDataset
      .usingType(SolidProfileShapeShapeType)
      .startLinkQuery(mainProfileResource, MAIN_PROFILE_SUBJECT, {
        name: true,
        knows: {
          name: true,
        },
      })
      .subscribe();

    // Should have regular information
    let mainProfile = solidLdoDataset
      .usingType(SolidProfileShapeShapeType)
      .fromSubject(MAIN_PROFILE_SUBJECT);
    let resourceUris = solidLdoDataset
      .getResources()
      .map((resource) => resource.uri);
    expect(resourceUris.length).toBe(3);
    expect(resourceUris).toContain(MAIN_PROFILE_URI);
    expect(resourceUris).toContain(OTHER_PROFILE_URI);
    expect(mainProfile.name).toBe("Main User");
    expect(mainProfile.knows?.size).toBe(1);
    expect(mainProfile.knows?.toArray()[0].name).toBe("Other User");

    // Update to include a new document
    const cMainProfile = changeData(mainProfile, mainProfileResource);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cMainProfile.knows?.add({ "@id": THIRD_PROFILE_SUBJECT });
    await commitData(cMainProfile);

    // Wait for 200ms to allow the other file to be fetched
    await wait(200);

    // After the data is committed, the third profile should be present
    mainProfile = solidLdoDataset
      .usingType(SolidProfileShapeShapeType)
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
    const knowNames = mainProfile.knows?.map((knowsPerson) => knowsPerson.name);
    expect(knowNames).toContain("Other User");
    expect(knowNames).toContain("Third User");
  });

  it("handles subscriptions if data changes on the Pod", async () => {
    const mainProfileResource = solidLdoDataset.getResource(MAIN_PROFILE_URI);
    await solidLdoDataset
      .usingType(SolidProfileShapeShapeType)
      .startLinkQuery(mainProfileResource, MAIN_PROFILE_SUBJECT, {
        name: true,
        knows: {
          name: true,
        },
      })
      .subscribe();

    // Should have regular information
    let mainProfile = solidLdoDataset
      .usingType(SolidProfileShapeShapeType)
      .fromSubject(MAIN_PROFILE_SUBJECT);
    let resourceUris = solidLdoDataset
      .getResources()
      .map((resource) => resource.uri);
    expect(resourceUris.length).toBe(3);
    expect(resourceUris).toContain(MAIN_PROFILE_URI);
    expect(resourceUris).toContain(OTHER_PROFILE_URI);
    expect(mainProfile.name).toBe("Main User");
    expect(mainProfile.knows?.size).toBe(1);
    expect(mainProfile.knows?.toArray()[0].name).toBe("Other User");

    console.log("==================");

    // Update to include a new document
    const cMainProfile = changeData(mainProfile, mainProfileResource);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cMainProfile.knows?.add({ "@id": THIRD_PROFILE_SUBJECT });
    await commitData(cMainProfile);

    // Wait for 200ms to allow the other file to be fetched
    await wait(200);

    // After the data is committed, the third profile should be present
    mainProfile = solidLdoDataset
      .usingType(SolidProfileShapeShapeType)
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
    const knowNames = mainProfile.knows?.map((knowsPerson) => knowsPerson.name);
    expect(knowNames).toContain("Other User");
    expect(knowNames).toContain("Third User");
  });
});
