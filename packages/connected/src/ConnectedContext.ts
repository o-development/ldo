/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ConnectedLdoDataset } from "./ConnectedLdoDataset";
import type { ConnectedPlugin } from "./ConnectedPlugin";

/**
 * Each Plugin comes with a context. This is the aggregate of all those contexts
 * It is passed between the various components of the "connected" library
 */
export type ConnectedContext<
  Plugins extends ConnectedPlugin<any, any, any, any>[],
> = {
  dataset: ConnectedLdoDataset<Plugins>;
} & {
  [P in Plugins[number] as P["name"]]: P["types"]["context"];
};
