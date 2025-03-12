import type { ConnectedLdoDataset } from "./ConnectedLdoDataset";
import type { ConnectedPlugin } from "./ConnectedPlugin";

export type ConnectedContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Plugins extends ConnectedPlugin<any, any, any, any>[],
> = {
  dataset: ConnectedLdoDataset<Plugins>;
} & {
  [P in Plugins[number] as P["name"]]: P["types"]["context"];
};
