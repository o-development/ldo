import type { ConnectedContext, ConnectedPlugin } from "@ldo/connected";
import type { NextGraphUri } from "./types";
import type { NextGraphResource } from "./resources/NextGraphResource";

export interface NextGraphConnectedContext {
  sessionId?: string;
}
export interface NextGraphConnectedPlugin
  extends ConnectedPlugin<
    "nextgraph",
    NextGraphUri,
    NextGraphResource,
    NextGraphConnectedContext
  > {
  name: "nextgraph";
  getResource: (
    uri: NextGraphUri,
    context: ConnectedContext<this[]>,
  ) => NextGraphResource;
  createResource(context: ConnectedContext<this[]>): Promise<NextGraphResource>;
}

export const nextgGraphConnectedPlugin: NextGraphConnectedPlugin = {
  name: "nextgraph",

  getResource: function (_uri: NextGraphUri): NextGraphResource {
    throw new Error("Function not implemented.");
  },

  createResource: function (): Promise<NextGraphResource> {
    throw new Error("Function not implemented.");
  },

  isUriValid: function (uri: string): uri is NextGraphUri {
    throw new Error("Function not implemented.");
  },

  initialContext: {
    sessionId: undefined,
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore "Types" only exists for the typing system
  types: {},
};
