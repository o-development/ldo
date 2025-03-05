import { createDatasetFactory } from "@ldo/dataset";
import { ConnectedLdoDataset } from "./ConnectedLdoDataset";
import { createTransactionDatasetFactory } from "@ldo/subscribable-dataset";
import type { ContainerUri, LeafUri } from "../../solid/src/index";
import { SolidContainer, SolidLeaf } from "./Resource";

interface SolidPlugin {
  name: "solid";
  getResource(uri: ContainerUri): SolidContainer;
  getResource(uri: LeafUri): SolidLeaf;
  getResource(uri: string): SolidLeaf | SolidContainer;
}

const solidPlugin: SolidPlugin = {
  name: "solid",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getResource(_uri: string): any {
    throw new Error();
  },
};

interface NextgraphPlugin {
  name: "nextgraph";
  getResource(uri: ContainerUri);
  getResource(uri: string): "nextgraphResource";
}

const nextgraphPlugin: NextgraphPlugin = {
  name: "nextgraph",
  getResource(_uri: string): "nextgraphResource" {
    return "nextgraphResource";
  },
};

async function main() {
  const dataset = new ConnectedLdoDataset(
    [solidPlugin, nextgraphPlugin],
    createDatasetFactory(),
    createTransactionDatasetFactory(),
  );

  const solidContainerResource = dataset.getResource("https://example.com/");
  const solidLeafResource = dataset.getResource(
    "https://example.com/resource.ttl",
  );
  const stringUri: string = "https://example.com/";
  const allResources = dataset.getResource(stringUri);
  const solidResource = dataset.getResource(stringUri, "solid");
  const nextgraphResource = dataset.getResource(stringUri, "nextgraph");

  const nextgraphResource2 = dataset.getResource(
    "did:ng:o:OGNxCWfTXMfYIJi8HCEfL6_uExLtCHrK0JGT4fU5pH4A:v:R2y5iENVwuaaoW86TvMbfZfCIrNXaNIFA3BF6fx9svQA",
  );
}
main();
