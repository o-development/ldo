import type { ConnectedContext, ConnectedPlugin } from "@ldo/connected";
import type { SolidContainerUri, SolidLeafUri, SolidUri } from "./types";
import { SolidLeaf } from "./resources/SolidLeaf";
import { SolidContainer } from "./resources/SolidContainer";
import { isSolidContainerUri, isSolidUri } from "./util/isSolidUri";

export interface SolidConnectedContext {
  fetch?: typeof fetch;
}
export interface SolidConnectedPlugin
  extends ConnectedPlugin<
    "solid",
    SolidUri,
    SolidLeaf | SolidContainer,
    SolidConnectedContext,
    undefined
  > {
  name: "solid";
  getResource:
    | ((uri: SolidLeafUri, context: ConnectedContext<this[]>) => SolidLeaf)
    | ((
        uri: SolidContainerUri,
        context: ConnectedContext<this[]>,
      ) => SolidContainer);
  createResource(context: ConnectedContext<this[]>): Promise<SolidLeaf>;
}

function getResource(
  uri: SolidLeafUri,
  context: ConnectedContext<SolidConnectedPlugin[]>,
): SolidLeaf;
function getResource(
  uri: SolidContainerUri,
  context: ConnectedContext<SolidConnectedPlugin[]>,
): SolidContainer;
function getResource(
  uri: SolidLeafUri | SolidContainerUri,
  context: ConnectedContext<SolidConnectedPlugin[]>,
): SolidLeaf | SolidContainer {
  if (isSolidContainerUri(uri)) {
    return new SolidContainer(uri, context);
  } else {
    return new SolidLeaf(uri, context);
  }
}

export const solidConnectedPlugin: SolidConnectedPlugin = {
  name: "solid",

  getResource,

  createResource: function (): Promise<SolidLeaf> {
    throw new Error("Function not implemented.");
  },

  isUriValid: function (uri: string): uri is SolidLeafUri | SolidContainerUri {
    return isSolidUri(uri);
  },

  initialContext: {
    fetch: undefined,
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore "Types" only exists for the typing system
  types: {},
};
