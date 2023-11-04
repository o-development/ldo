import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import { createDataset } from "@ldo/dataset";
import { LdoDatasetFactory } from "./LdoDatasetFactory";

/**
 * Creates an LDO Dataset Factory
 * @returns An LDO Dataset Factory
 */
export function createLdoDatasetFactory() {
  const datasetFactory: DatasetFactory<Quad> = {
    dataset: (quads?: Dataset<Quad> | Quad[]): Dataset<Quad> => {
      return createDataset(quads);
    },
  };
  return new LdoDatasetFactory(datasetFactory);
}

/**
 * Create an LDO Dataset
 * @param initialDataset
 * @returns An LDO Dataset Factory
 */
export function createLdoDataset(
  initialDataset?: Dataset<Quad, Quad> | Quad[],
) {
  const ldoDatasetFactory = createLdoDatasetFactory();
  return ldoDatasetFactory.dataset(initialDataset);
}
