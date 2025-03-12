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
  createResource(): Promise<SolidLeaf>;
  isUriValid(uri: string): uri is SolidLeafUri | SolidContainerUri;
  normalizeUri?: (uri: string) => SolidLeafUri | SolidContainerUri;
  context: {
    fetch?: typeof fetch;
  };
}

export const solidConnectedPlugin: SolidConnectedPlugin = {
  name: "solid",
  identifierType: "https://example.com",
  getResource(_uri: SolidUri): SolidContainer | SolidLeaf {
    throw new Error("Not Implemented");
  },
  createResource: function (): Promise<SolidLeaf> {
    throw new Error("Function not implemented.");
  },
  isUriValid: function (uri: string): uri is SolidLeafUri | SolidContainerUri {
    throw new Error("Function not implemented.");
  },
  context: {},
};
