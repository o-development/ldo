import type {
  ConnectedContext,
  ConnectedPlugin,
  Resource,
} from "@ldo/connected";
import type { SolidContainerUri, SolidLeafUri, SolidUri } from "./types";
import { SolidLeaf } from "./resources/SolidLeaf";
import { SolidContainer } from "./resources/SolidContainer";
import { isSolidContainerUri, isSolidUri } from "./util/isSolidUri";
import type { ResourceCapability } from "@ldo/connected";
import type { SolidResource } from "./resources/SolidResource.js";
import type { ApplyCapabilities } from "@ldo/connected";

/**
 * The Type of the SolidConnectedContext
 */
export interface SolidConnectedContext {
  fetch?: typeof fetch;
}
export interface SolidConnectedPlugin<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Capabilities extends ResourceCapability<string, SolidResource<any[]>>[],
> extends ConnectedPlugin<
    "solid",
    SolidUri,
    ApplyCapabilities<
      SolidLeaf<Capabilities> | SolidContainer<Capabilities>,
      Capabilities
    >,
    // | ApplyCapabilities<SolidContainer<Capabilities>, Capabilities>,
    SolidConnectedContext,
    undefined
  > {
  name: "solid";
  getResource:
    | ((
        uri: SolidLeafUri,
        context: ConnectedContext<this[]>,
      ) => ApplyCapabilities<SolidLeaf<Capabilities>, Capabilities>)
    | ((
        uri: SolidContainerUri,
        context: ConnectedContext<this[]>,
      ) => ApplyCapabilities<SolidContainer<Capabilities>, Capabilities>);
  // getResource(uri: SolidLeafUri, context: ConnectedContext<this[]>): SolidLeaf;
  // getResource(
  //   uri: SolidContainerUri,
  //   context: ConnectedContext<this[]>,
  // ): SolidContainer;
  // getResource(
  //   uri: SolidContainerUri,
  //   context: ConnectedContext<this[]>,
  // ): SolidContainer;
  // getResource(uri: SolidLeafUri, context: ConnectedContext<this[]>): SolidLeaf;
  // getResource(
  //   uri: SolidLeafUri | SolidContainerUri,
  //   context: ConnectedContext<this[]>,
  // ): SolidLeaf | SolidContainer;
  // getResource<Uri extends SolidLeafUri | SolidContainerUri>(
  //   uri: Uri,
  //   context: ConnectedContext<this[]>,
  // ): Uri extends SolidContainerUri ? SolidContainer : SolidLeaf;
  createResource(
    context: ConnectedContext<this[]>,
  ): Promise<ApplyCapabilities<SolidLeaf<Capabilities>, Capabilities>>;

  extendResource<
    Namespace extends string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Capability extends (resource: any) => unknown,
  >(
    capability: Capability,
    namespace: Namespace,
  ): SolidConnectedPlugin<
    [...Capabilities, { namespace: Namespace; capability: Capability }]
  >;
}

function getResourceFactory<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Capabilities extends ResourceCapability<string, Resource<any>>[],
>(capabilities: Capabilities) {
  function getResource(
    uri: SolidLeafUri,
    context: ConnectedContext<SolidConnectedPlugin<Capabilities>[]>,
  ): ApplyCapabilities<SolidLeaf<Capabilities>, Capabilities>;
  function getResource(
    uri: SolidContainerUri,
    context: ConnectedContext<SolidConnectedPlugin<Capabilities>[]>,
  ): ApplyCapabilities<SolidContainer<Capabilities>, Capabilities>;
  function getResource(
    uri: SolidLeafUri | SolidContainerUri,
    context: ConnectedContext<SolidConnectedPlugin<Capabilities>[]>,
  ): ApplyCapabilities<
    SolidLeaf<Capabilities> | SolidContainer<Capabilities>,
    Capabilities
  > {
    if (isSolidContainerUri(uri)) {
      return applyCapabilities(
        new SolidContainer(uri, context),
        capabilities,
      ) as unknown as ApplyCapabilities<
        SolidContainer<Capabilities>,
        Capabilities
      >;
    } else {
      return applyCapabilities(
        new SolidLeaf(uri, context),
        capabilities,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as unknown as ApplyCapabilities<SolidLeaf<Capabilities>, Capabilities>;
    }
  }

  return getResource;
}

function applyCapabilities<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends SolidResource<Cs>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Cs extends ResourceCapability<string, SolidResource<Cs>>[],
>(resource: R, capabilities: Cs): ApplyCapabilities<R, Cs> {
  if (capabilities.length === 0) return resource as ApplyCapabilities<R, Cs>;

  const [capability, ...otherCapabilities] = capabilities;

  const applied = applyCapabilities(
    Object.assign(resource, {
      [capability.namespace]: capability.capability(resource),
    }),
    otherCapabilities,
  );

  return applied as ApplyCapabilities<R, Cs>;
}

/**
 * This plugin can be given to a ConnectedDataset to let it connect to Solid
 * servers.
 *
 * @example
 * ```
 * import { createConnectedLdoDataset } from "@ldo/connected";
 * import { solidConnectedPlugin } from "@ldo/connected-solid";
 *
 * const solidConnectedDataset = createConnectedLdoDataset([
 *   solidConnectedPlugin
 * ]);
 * ```
 */
const createSolidConnectedPlugin = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Capabilities extends ResourceCapability<string, Resource<any>>[],
>(
  capabilities: Capabilities,
): SolidConnectedPlugin<Capabilities> => ({
  name: "solid",

  getResource: getResourceFactory(
    capabilities,
  ) as SolidConnectedPlugin<Capabilities>["getResource"],

  createResource: function () {
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

  normalizeUri(uri: SolidUri): SolidUri {
    const url = new URL(uri);
    url.hash = "";
    url.search = "";
    return url.toString() as SolidUri;
  },

  extendResource(capability, namespace) {
    return createSolidConnectedPlugin([
      ...capabilities,
      { capability, namespace },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ]) as any /*SolidConnectedPlugin<
      [
        ...Capabilities,
        { capability: typeof capability; namespace: typeof namespace },
      ]
    >*/;
  },
});

export const solidConnectedPlugin = createSolidConnectedPlugin([] as []);
