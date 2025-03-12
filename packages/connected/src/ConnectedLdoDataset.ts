/* eslint-disable @typescript-eslint/no-explicit-any */
import { LdoDataset } from "@ldo/ldo";
import type { ConnectedPlugin } from "./ConnectedPlugin";
import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import type { ITransactionDatasetFactory } from "@ldo/subscribable-dataset";
import { InvalidIdentifierResource } from "./InvalidIdentifierResource";
import type { ConnectedContext } from "./ConnectedContext";

type ReturnTypeFromArgs<Func, Arg> = Func extends (arg: Arg) => infer R
  ? R
  : never;

export class ConnectedLdoDataset<
  Plugins extends ConnectedPlugin<any, any, any, any>[],
> extends LdoDataset {
  private plugins: Plugins;
  /**
   * @internal
   *
   * A mapping between a resource URI and a Solid resource
   */
  protected resourceMap: Map<string, Plugins[number]["types"]["resource"]>;
  protected context: ConnectedContext<Plugins>;

  constructor(
    plugins: Plugins,
    datasetFactory: DatasetFactory<Quad, Quad>,
    transactionDatasetFactory: ITransactionDatasetFactory<Quad>,
    initialDataset?: Dataset<Quad, Quad>,
  ) {
    super(datasetFactory, transactionDatasetFactory, initialDataset);
    this.plugins = plugins;
    this.resourceMap = new Map();
    this.context = {
      dataset: this,
    };
    this.plugins.forEach(
      (plugin) => (this.context[plugin.name] = plugin.initialContext),
    );
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
  >(
    uri: UriType,
    pluginName?: Name,
  ): UriType extends Plugin["types"]["uri"]
    ? ReturnTypeFromArgs<Plugin["getResource"], UriType>
    : ReturnType<Plugin["getResource"]> | InvalidIdentifierResource {
    // Check for which plugins this uri is valid
    const validPlugins = this.plugins
      .filter((plugin) => plugin.isUriValid(uri))
      .filter((plugin) => (pluginName ? pluginName === plugin.name : true));
    if (validPlugins.length === 0) {
      return new InvalidIdentifierResource(uri) as any;
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
      resource = plugin.getResource(uri, this.context);
      this.resourceMap.set(normalizedUri, resource);
    }
    return resource as any;
  }

  async createResource<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
  >(name: Name): Promise<ReturnType<Plugin["createResource"]>> {
    const validPlugin = this.plugins.find((plugin) => name === plugin.name)!;
    const newResourceResult = await validPlugin.createResource(this.context);
    if (newResourceResult.isError) return newResourceResult;
    this.resourceMap.set(newResourceResult.uri, newResourceResult);
    return newResourceResult;
  }

  setContext<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
  >(name: Name, context: Plugin["types"]["context"]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.context[name] = context;
  }
}
