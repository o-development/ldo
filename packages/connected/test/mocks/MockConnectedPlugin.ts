import type { ConnectedContext, ConnectedPlugin } from "@ldo/connected";
import { MockResource } from "./MockResource.js";
import { v4 } from "uuid";

/**
 * The Type of the SolidConnectedContext
 */
export interface MockConnectedContext {}

export interface MockConnectedPlugin
  extends ConnectedPlugin<
    "mock",
    string,
    MockResource,
    MockConnectedContext,
    undefined
  > {
  name: "mock";
  getResource: (uri: string, context: ConnectedContext<this[]>) => MockResource;
  createResource(context: ConnectedContext<this[]>): Promise<MockResource>;
}

export const mockConnectedPlugin: MockConnectedPlugin = {
  name: "mock",

  getResource: function (
    uri: string,
    _context: ConnectedContext<MockConnectedPlugin[]>,
  ): MockResource {
    return new MockResource(uri);
  },

  createResource: async function (): Promise<MockResource> {
    return new MockResource(v4());
  },

  isUriValid: function (uri: string): uri is string {
    return typeof uri === "string";
  },

  initialContext: {},
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore "Types" only exists for the typing system
  types: {},
};
