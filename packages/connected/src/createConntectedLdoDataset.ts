import { createDatasetFactory } from "@ldo/dataset";
import { ConnectedLdoDataset } from "./ConnectedLdoDataset";
import type { ConnectedPlugin } from "./ConnectedPlugin";
import { createTransactionDatasetFactory } from "@ldo/subscribable-dataset";

export function createConnectedLdoDataset<Plugins extends ConnectedPlugin[]>(
  plugins: Plugins,
): ConnectedLdoDataset<Plugins> {
  return new ConnectedLdoDataset(
    plugins,
    createDatasetFactory(),
    createTransactionDatasetFactory(),
  );
}
