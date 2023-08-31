import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import { createDataset } from "@ldo/dataset";
import { LdoDatasetFactory } from "./LdoDatasetFactory";

export function createLdoDatasetFactory() {
  const datasetFactory: DatasetFactory<Quad> = {
    dataset: (quads?: Dataset<Quad> | Quad[]): Dataset<Quad> => {
      return createDataset(quads);
    },
  };
  return new LdoDatasetFactory(datasetFactory);
}

export function createLdoDataset(
  initialDataset?: Dataset<Quad, Quad> | Quad[],
) {
  const ldoDatasetFactory = createLdoDatasetFactory();
  return ldoDatasetFactory.dataset(initialDataset);
}
