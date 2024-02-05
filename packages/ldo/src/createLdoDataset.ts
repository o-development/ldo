import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import { createDataset } from "@ldo/dataset";
import { LdoDatasetFactory } from "./LdoDatasetFactory";
import type { LdoDataset } from "./LdoDataset";

/**
 * @category Getting an LdoDataset
 *
 * A helper function that creates an LdoDatasetFactory.
 * This function exists for parity with RDF/JS. Most developers will not use it. Instead, it's better to use {@link createLdoDataset}.
 *
 * @returns An LDO Dataset Factory
 *
 * @example
 * ```typescript
 * createLdoDatasetFactory(): Promise<LdoDatasetFactory>
 * ```
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
 * @category Getting an LdoDataset
 *
 * A function that initializes an LdoDataset.
 *
 * @param initialDataset - An optional dataset or array of quads for the new dataset
 *
 * @returns An LDO Dataset initialized with the intitial dataset if any
 *
 * @example
 * ```typescript
 * import { createLdoDataset } from "@ldo/ldo";
 *
 * const ldoDataset = createLdoDataset();
 * ```
 */
export function createLdoDataset(
  initialDataset?: Dataset<Quad, Quad> | Quad[],
): LdoDataset {
  const ldoDatasetFactory = createLdoDatasetFactory();
  return ldoDatasetFactory.dataset(initialDataset);
}
