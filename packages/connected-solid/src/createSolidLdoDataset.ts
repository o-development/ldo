import { ConnectedLdoDataset } from "@ldo/connected";
import { solidConnectedPlugin } from "./SolidConnectedPlugin";
import { createDatasetFactory } from "@ldo/dataset";
import { createTransactionDatasetFactory } from "@ldo/subscribable-dataset";

export function createSolidLdoDataset() {
  const solidLdoDataset = new ConnectedLdoDataset(
    [solidConnectedPlugin],
    createDatasetFactory(),
    createTransactionDatasetFactory(),
  );
  return solidLdoDataset;
}
