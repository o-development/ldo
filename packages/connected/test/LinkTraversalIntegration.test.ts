import type { ConnectedLdoDataset } from "../src/ConnectedLdoDataset";
import { createConnectedLdoDataset } from "../src";
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
} from "./LinkTraversalData";
import { SolidProfileShapeShapeType } from "./.ldo/solidProfile.shapeTypes";

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
    console.log(resourceUris);
    expect(resourceUris.length).toBe(2);
    expect(resourceUris).toContain(MAIN_PROFILE_URI);
    expect(resourceUris).toContain(OTHER_PROFILE_URI);
    expect(data.name).toBe("Main User");
    expect(data.knows?.toArray()[0].name).toBe("Other User");
  });
});
