/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LdoBase, ShapeType } from "@ldo/ldo";
import { LdoDataset, startTransaction } from "@ldo/ldo";
import type { ConnectedPlugin } from "./ConnectedPlugin";
import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import type { ITransactionDatasetFactory } from "@ldo/subscribable-dataset";
import { InvalidIdentifierResource } from "./InvalidIdentifierResource";
import type { ConnectedContext } from "./ConnectedContext";
import type {
  GetResourceReturnType,
  IConnectedLdoDataset,
} from "./IConnectedLdoDataset";
import { ConnectedLdoTransactionDataset } from "./ConnectedLdoTransactionDataset";
import type { SubjectNode } from "@ldo/rdf-utils";

/**
 * A ConnectedLdoDataset has all the functionality of a LdoDataset with the
 * added functionality of keeping track of fetched remote Resources.
 *
 * It is recommended to use the { @link createConnectedLdoDataset } to
 * initialize this class.
 *
 * @example
 * ```typescript
 * import { createConnectedLdoDataset } from "@ldo/connected";
 * import { ProfileShapeType } from "./.ldo/profile.shapeTypes.ts"
 *
 * // ...
 *
 * const connectedLdoDataset = createConnectedLdoDataset();
 *
 * const profileDocument = connectedLdoDataset
 *   .getResource("https://example.com/profile");
 * await profileDocument.read();
 *
 * const profile = connectedLdoDataset
 *   .using(ProfileShapeType)
 *   .fromSubject("https://example.com/profile#me");
 * ```
 */
export class ConnectedLdoDataset<
    Plugins extends ConnectedPlugin<any, any, any, any>[],
  >
  extends LdoDataset
  implements IConnectedLdoDataset<Plugins>
{
  /**
   * @internal
   *
   * A list of plugins used by this dataset
   */
  private plugins: Plugins;
  /**
   * @internal
   *
   * A mapping between a resource URI and a resource
   */
  protected resourceMap: Map<string, Plugins[number]["types"]["resource"]>;

  /**
   * @internal
   *
   * Context for each plugin (usually utilities for authentication)
   */
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore this is a builder. It will eventually match
    this.context = {
      dataset: this,
    };
    this.plugins.forEach(
      (plugin) => (this.context[plugin.name] = plugin.initialContext),
    );
  }

  /**
   * @internal
   *
   * A helper function to return a plugin based in the plugin name and uri.
   */
  private getValidPlugin(
    uri: string,
    pluginName?: string,
  ): Plugins[number] | undefined {
    // Check for which plugins this uri is valid
    const validPlugins = this.plugins
      .filter((plugin) => plugin.isUriValid(uri))
      .filter((plugin) => (pluginName ? pluginName === plugin.name : true));
    if (validPlugins.length === 0) {
      return undefined;
    } else if (validPlugins.length > 1) {
      // TODO: LDO is currently not architected to have an ID valid in multiple
      // protocols. This will need to be refactored if this is ever the case.
      throw new Error(
        "LDO Connect does not currently support two plugins with overlappng uris",
      );
    }
    return validPlugins[0];
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
   * const profileDocument = connectedLdoDataset
   *   .getResource("https://example.com/profile");
   * ```
   */
  getResource<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
    UriType extends string,
  >(uri: UriType, pluginName?: Name): GetResourceReturnType<Plugin, UriType> {
    const plugin = this.getValidPlugin(uri, pluginName);
    if (!plugin) return new InvalidIdentifierResource(uri) as any;
    const normalizedUri = plugin.normalizeUri?.(uri) ?? uri;

    let resource = this.resourceMap.get(normalizedUri);
    if (!resource) {
      resource = plugin.getResource(uri, this.context);
      this.resourceMap.set(normalizedUri, resource);
    }
    // HACK: cast to any
    return resource as any;
  }

  async createResource<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
  >(name: Name): Promise<ReturnType<Plugin["createResource"]>> {
    const validPlugin = this.plugins.find((plugin) => name === plugin.name)!;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore I have no idea why this doesn't work
    const newResourceResult = await validPlugin.createResource(this.context);
    // HACK: cast to any
    if (newResourceResult.isError) return newResourceResult as any;
    this.resourceMap.set(newResourceResult.uri, newResourceResult);
    // HACK: cast to any
    return newResourceResult as any;
  }

  forgetResource(uri: string): boolean {
    const plugin = this.getValidPlugin(uri);
    const normalizedUri = plugin?.normalizeUri?.(uri) ?? uri;
    return this.resourceMap.delete(normalizedUri);
  }

  forgetAllResources(): void {
    this.resourceMap.clear();
  }

  /**
   * Shorthand for connectedLdoDataset
   *   .usingType(shapeType)
   *   .write(...resources.map((r) => r.uri))
   *   .fromSubject(subject);
   * @param shapeType - The shapetype to represent the data
   * @param subject - A subject URI
   * @param resources - The resources changes to should written to
   */
  createData<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: string | SubjectNode,
    resource: Plugins[number]["types"]["resource"],
    ...additionalResources: Plugins[number]["types"]["resource"][]
  ): Type {
    const resources = [resource, ...additionalResources];
    const linkedDataObject = this.usingType(shapeType)
      .write(...resources.map((r) => r.uri))
      .fromSubject(subject);
    startTransaction(linkedDataObject);
    return linkedDataObject;
  }

  setContext<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
  >(name: Name, context: Plugin["types"]["context"]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.context[name] = context;
  }

  public startTransaction(): ConnectedLdoTransactionDataset<Plugins> {
    return new ConnectedLdoTransactionDataset(
      this,
      this.context,
      this.datasetFactory,
      this.transactionDatasetFactory,
    );
  }
}
