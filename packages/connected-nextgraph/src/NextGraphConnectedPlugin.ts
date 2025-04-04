import type { ConnectedContext, ConnectedPlugin } from "@ldo/connected";
import type { NextGraphUri } from "./types";
import { NextGraphResource } from "./resources/NextGraphResource";
import ng from "nextgraph";
import { isNextGraphUri } from "./util/isNextGraphUri";

export interface NextGraphConnectedContext {
  sessionId?: string;
  protectedStoreId?: string;
  privateStoreId?: string;
  publicStoreId?: string;
}

export interface NextGraphCreateResourceOptions {
  storeType?: "public" | "protected" | "private" | "group" | "dialog";
  storeRepo?: string;
}

export interface NextGraphConnectedPlugin
  extends ConnectedPlugin<
    "nextgraph",
    NextGraphUri,
    NextGraphResource,
    NextGraphConnectedContext,
    NextGraphCreateResourceOptions
  > {
  name: "nextgraph";
  getResource: (
    uri: NextGraphUri,
    context: ConnectedContext<this[]>,
  ) => NextGraphResource;
  createResource(context: ConnectedContext<this[]>): Promise<NextGraphResource>;
}

export const nextGraphConnectedPlugin: NextGraphConnectedPlugin = {
  name: "nextgraph",

  getResource: function (
    uri: NextGraphUri,
    context: ConnectedContext<NextGraphConnectedPlugin[]>,
  ): NextGraphResource {
    return new NextGraphResource(uri, context);
  },

  createResource: async function (
    context: ConnectedContext<NextGraphConnectedPlugin[]>,
    options?: NextGraphCreateResourceOptions,
  ): Promise<NextGraphResource> {
    const storeType = options?.storeType;
    const storeRepo =
      options?.storeRepo ??
      (storeType === "protected"
        ? context.nextgraph.protectedStoreId
        : storeType === "public"
        ? context.nextgraph.publicStoreId
        : storeType === "private"
        ? context.nextgraph.privateStoreId
        : undefined);

    const nuri: NextGraphUri = await ng.doc_create(
      context.nextgraph.sessionId,
      "Graph",
      "data:graph",
      "store",
      storeType,
      storeRepo,
    );
    const newResource = new NextGraphResource(nuri, context);
    await newResource.read();
    return newResource;
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
