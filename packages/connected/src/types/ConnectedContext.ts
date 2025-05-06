/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ConnectedPlugin } from "./ConnectedPlugin";
import type { IConnectedLdoDataset } from "./IConnectedLdoDataset";

/**
 * Each Plugin comes with a context. This is the aggregate of all those contexts
 * It is passed between the various components of the "connected" library
 */
export type ConnectedContext<
  Plugins extends ConnectedPlugin<any, any, any, any>[],
> = {
  dataset: IConnectedLdoDataset<Plugins>;
} & {
  [P in Plugins[number] as P["name"]]: P["types"]["context"];
};
