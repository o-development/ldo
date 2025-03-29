import type { ConnectedContext, ConnectedPlugin } from "@ldo/connected";
import type { NextGraphUri } from "./types";
import { NextGraphResource } from "./resources/NextGraphResource";
import ng from "nextgraph";
import { isNextGraphUri } from "./util/isNextGraphUri";

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

  getResource: function (
    uri: NextGraphUri,
    context: ConnectedContext<NextGraphConnectedPlugin[]>,
  ): NextGraphResource {
    // NIKO: Do I need to split into "base?" Remind me again of why I need base?
    return new NextGraphResource(uri, context);
  },

  createResource: async function (
    context: ConnectedContext<NextGraphConnectedPlugin[]>,
  ): Promise<NextGraphResource> {
    const nuri: NextGraphUri = await ng.doc_create(
      context.nextgraph.sessionId,
      "Graph",
      // NIKO: Can this always be "data:graph"?
      "data:graph",
      // NIKO: What are the options here again?
      "protected",
      // NIKO: What is this? Should it be changed?
      "B381BvfdAFYPBkdhDrsqnMMg5pnJMWJgJbZobZErXZMA",
      // NIKO: Can this always be "store"?
      "store",
    );
    return new NextGraphResource(nuri, context);
  },

  isUriValid: function (uri: string): uri is NextGraphUri {
    return isNextGraphUri(uri);
  },

  initialContext: {
    sessionId: undefined,
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore "Types" only exists for the typing system
  types: {},
};
