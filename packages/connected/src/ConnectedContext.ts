import type { ConnectedLdoDataset } from "./ConnectedLdoDataset";
import type { ConnectedPlugin } from "./ConnectedPlugin";

export type ConnectedContext<Plugins extends ConnectedPlugin[]> = {
  dataset: ConnectedLdoDataset<Plugins>;
} & {
  [P in Plugins[number] as P["name"]]: P["context"];
};
