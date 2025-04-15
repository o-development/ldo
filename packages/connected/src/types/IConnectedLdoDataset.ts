/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LdoDataset } from "@ldo/ldo";
import type { ConnectedPlugin } from "./ConnectedPlugin";
import type { InvalidIdentifierResource } from "../InvalidIdentifierResource";

export type ReturnTypeFromArgs<Func, Arg> = Func extends (
  arg: Arg,
  context: any,
) => infer R
  ? R
  : never;

export type GetResourceReturnType<
  Plugin extends ConnectedPlugin,
  UriType extends string,
> = UriType extends Plugin["types"]["uri"]
  ? ReturnTypeFromArgs<Plugin["getResource"], UriType>
  : ReturnType<Plugin["getResource"]> | InvalidIdentifierResource;

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
 * // At least one plugin needs to be provided to a ConnectedLdoDataset. In this
 * // example we'll use both the Solid and NextGraph plugins.
 * import { solidConnectedPlugin } from "@ldo/connected-solid";
 * import { nextGraphConnectedPlugin } from "@ldo/connected-nextgraph";
 *
 * // ...
 *
 * const connectedLdoDataset = createConnectedLdoDataset([
 *   solidConnectedPlugin,
 *   nextGraphConnectedPlugin
 * ]);
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
export interface IConnectedLdoDataset<Plugins extends ConnectedPlugin[]>
  extends LdoDataset {
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
  >(
    uri: UriType,
    pluginName?: Name,
  ): GetResourceReturnType<Plugin, UriType>;

  /**
   * Generates a random uri and creates a resource.
   *
   * @param pluginName - A string name for the platform you'd like to create
   * the resource on.
   * @param createResourceOptions - Some set of options specific to the plugin
   * you've selected.
   * @returns A created resource or an error
   *
   * @example
   * ```typescript
   * const profileDocument = await connectedLdoDataset
   *   .createResource("solid");
   * ```
   */
  createResource<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
  >(
    name: Name,
    createResourceOptions?: Plugin["types"]["createResourceOptions"],
  ): Promise<ReturnType<Plugin["createResource"]>>;

  /**
   * Removes a resource from local memory
   * @param uri - the URI of the resource to remove
   * @returns true if the resource was present before removal
   *
   * @example
   * ```typescript
   * connectedLdoDataset.forgetResource("https://example.com/resource.ttl");
   * ```
   */
  forgetResource(uri: string): boolean;

  /**
   * Removes all resources from memory
   *
   * @example
   * ```typescript
   * connectedLdoDataset.forgetAllResources();
   * ```
   */
  forgetAllResources(): void;

  /**
   * Sets conetext for a specific plugin
   *
   * @param pluginName - the name of the plugin
   * @param context - the context for this specific plugin
   */
  setContext<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
  >(
    name: Name,
    context: Plugin["types"]["context"],
  );
}
