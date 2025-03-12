import { ConnectedLdoDataset } from "@ldo/connected";
import { solidConnectedPlugin } from "./SolidConnectedPlugin";
import { createDatasetFactory } from "@ldo/dataset";
import { createTransactionDatasetFactory } from "@ldo/subscribable-dataset";
import { nextGraphConnectedPlugin } from "@ldo/connected-nextgraph";

const dataset = new ConnectedLdoDataset(
  [solidConnectedPlugin, nextGraphConnectedPlugin],
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
