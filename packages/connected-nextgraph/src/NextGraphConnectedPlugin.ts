import type { ConnectedPlugin } from "@ldo/connected";
import type { NextGraphUri } from "./types";
import type { NextGraphResource } from "./resources/NextGraphResource";

export interface NextGraphConnectedPlugin extends ConnectedPlugin {
  name: "nextGraph";
  getResource(uri: NextGraphUri): NextGraphResource;
}

export const nextGraphConnectedPlugin: NextGraphConnectedPlugin = {
  name: "nextGraph",
  getResource(_uri: NextGraphUri): NextGraphResource {
    throw new Error("Not Implemented");
  },
};
