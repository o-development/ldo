import { LdoDataset } from "@ldo/ldo";
import type { ConnectedPlugin } from "./ConnectedPlugin";
import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import type { ITransactionDatasetFactory } from "@ldo/subscribable-dataset";
import { InvalidIdentifierResource } from "./InvalidIdentifierResource";

type ReturnTypeFromArgs<T, Arg> = T extends (arg: Arg) => infer R ? R : never;
type ResourceTypes<Plugins extends ConnectedPlugin[]> =
  | ReturnType<Plugins[number]["getResource"]>
  | InvalidIdentifierResource;
type GetResourceReturn<
  Plugin extends ConnectedPlugin,
  UriType extends string,
> = UriType extends Parameters<Plugin["getResource"]>[0]
  ? ReturnTypeFromArgs<Plugin["getResource"], UriType>
  : ResourceTypes<[Plugin]>;

export class ConnectedLdoDataset<
  Plugins extends ConnectedPlugin[],
> extends LdoDataset {
  private plugins: Plugins;
  /**
   * @internal
   *
   * A mapping between a resource URI and a Solid resource
   */
  protected resourceMap: Map<string, ResourceTypes<Plugins>>;

  constructor(
    plugins: Plugins,
    datasetFactory: DatasetFactory<Quad, Quad>,
    transactionDatasetFactory: ITransactionDatasetFactory<Quad>,
    initialDataset?: Dataset<Quad, Quad>,
  ) {
    super(datasetFactory, transactionDatasetFactory, initialDataset);
    this.plugins = plugins;
    this.resourceMap = new Map();
  }

  /**
   * Retireves a representation of a Resource at the given URI. This resource
   * represents the current state of the resource: whether it is currently
   * fetched or in the process of fetching as well as some information about it.
   *
   * @param uri - the URI of the resource
   * @param pluginName - optionally, force this function to choose a specific
   * plugin to use rather than perform content negotiation.
   *
   * @returns a Resource
   *
   * @example
   * ```typescript
   * const profileDocument = solidLdoDataset
   *   .getResource("https://example.com/profile");
   * ```
   */
  getResource<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
    UriType extends string,
  >(uri: UriType, pluginName?: Name): GetResourceReturn<Plugin, UriType> {
    // Check for which plugins this uri is valid
    const validPlugins = this.plugins
      .filter((plugin) => plugin.isUriValid(uri))
      .filter((plugin) => (pluginName ? pluginName === plugin.name : true));
    if (validPlugins.length === 0) {
      return new InvalidIdentifierResource(uri) as GetResourceReturn<
        Plugin,
        UriType
      >;
    } else if (validPlugins.length > 1) {
      // TODO: LDO is currently not architected to have an ID valid in multiple
      // protocols. This will need to be refactored if this is ever the case.
      throw new Error(
        "LDO Connect does not currently support two plugins with overlappng uris",
      );
    }
    const plugin = validPlugins[0];
    const normalizedUri = plugin.normalizeUri?.(uri) ?? uri;

    let resource = this.resourceMap.get(normalizedUri);
    if (!resource) {
      resource = plugin.getResource(uri) as ResourceTypes<Plugins>;
      this.resourceMap.set(normalizedUri, resource);
    }
    return resource as GetResourceReturn<Plugin, UriType>;
  }
}
