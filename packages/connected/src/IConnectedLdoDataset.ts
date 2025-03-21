/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LdoDataset } from "@ldo/ldo";
import type { ConnectedPlugin } from "./ConnectedPlugin";
import type { InvalidIdentifierResource } from "./InvalidIdentifierResource";

export type ReturnTypeFromArgs<Func, Arg> = Func extends (
  arg: Arg,
  context: any,
) => infer R
  ? R
  : never;

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
    : ReturnType<Plugin["getResource"]> | InvalidIdentifierResource;

  createResource<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
  >(
    name: Name,
  ): Promise<ReturnType<Plugin["createResource"]>>;

  setContext<
    Name extends Plugins[number]["name"],
    Plugin extends Extract<Plugins[number], { name: Name }>,
  >(
    name: Name,
    context: Plugin["types"]["context"],
  );
}
