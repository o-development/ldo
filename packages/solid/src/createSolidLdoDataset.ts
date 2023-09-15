import type { Dataset, DatasetFactory } from "@rdfjs/types";
import { SolidLdoDataset } from "./SolidLdoDataset";

import type { SolidLdoDatasetContext } from "./SolidLdoDatasetContext";
import crossFetch from "cross-fetch";
import { createDataset, createDatasetFactory } from "@ldo/dataset";
import { ResourceStore } from "./ResourceStore";

export interface CreateSolidLdoDatasetOptions {
  fetch?: typeof fetch;
  dataset?: Dataset;
  datasetFactory?: DatasetFactory;
}

export function createSolidLdoDataset(
  options?: CreateSolidLdoDatasetOptions,
): SolidLdoDataset {
  const finalFetch = options?.fetch || crossFetch;
  const finalDatasetFactory = options?.datasetFactory || createDatasetFactory();
  const finalDataset = options?.dataset || createDataset();

  // Ignoring because of circular dependency
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const context: SolidLdoDatasetContext = {
    fetch: finalFetch,
  };
  const solidLdoDataset = new SolidLdoDataset(
    context,
    finalDatasetFactory,
    finalDataset,
  );
  const resourceStore = new ResourceStore(context);
  context.solidLdoDataset = solidLdoDataset;
  context.resourceStore = resourceStore;

  return solidLdoDataset;
}
