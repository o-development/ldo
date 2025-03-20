import { ConnectedLdoDataset } from "@ldo/connected";
import { solidConnectedPlugin } from "./SolidConnectedPlugin";
import { createDatasetFactory } from "@ldo/dataset";
import { createTransactionDatasetFactory } from "@ldo/subscribable-dataset";

const dataset = new ConnectedLdoDataset(
  [solidConnectedPlugin],
  createDatasetFactory(),
  createTransactionDatasetFactory(),
);

const stringId: string = "blah";
const allResources = dataset.getResource(stringId);
const containerResource = dataset.getResource("https://example.com/container/");
const leafResource = dataset.getResource(
  "https://example.com/container/index.ttl",
);

const nextGraphResource = dataset.getResource("did:ng:cool");
