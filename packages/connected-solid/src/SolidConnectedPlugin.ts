import type { ConnectedPlugin } from "@ldo/connected";
import type { SolidContainerUri, SolidLeafUri, SolidUri } from "./types";
import type { SolidLeaf } from "./resources/SolidLeaf";
import type { SolidContainer } from "./resources/SolidContainer";

export interface SolidConnectedPlugin extends ConnectedPlugin {
  name: "solid";
  identifierType: SolidUri;
  getResource:
    | ((uri: SolidLeafUri) => SolidLeaf)
    | ((uri: SolidContainerUri) => SolidContainer);
}

export const solidConnectedPlugin: SolidConnectedPlugin = {
  name: "solid",
  identifierType: "https://example.com",
  getResource(_uri: SolidUri): SolidContainer | SolidLeaf {
    throw new Error("Not Implemented");
  },
};
