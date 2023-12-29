import type { DatasetFactory, Dataset, Quad } from "@rdfjs/types";
import { LdoDataset } from "./LdoDataset";

/**
 * @category Getting an LdoDataset
 * `LdoDatasetFactory` is a helper class that includes methods for creating LdoDatasets.
 *
 * This class exists for parity with RDF/JS. Most developers will not use it. Instead, it's better to use {@link createLdoDataset}.
 *
 * @example
 * ```typescript
 * import { createLdoDatasetFactory } from "ldo";
 *
 * const datasetFactory = // some RDF/JS Dataset Factory
 * const ldoDatasetFactory = new LdoDatasetFactory(datasetFactory);
 * const ldoDataset = ldoDatasetFactory.dataset(initialDataset);
 * ```
 */
export class LdoDatasetFactory implements DatasetFactory<Quad, Quad> {
  private datasetFactory: DatasetFactory<Quad, Quad>;

  /**
   * @constructor
   * @param datasetFactory - A generic dataset factory this factory will wrap
   */
  constructor(datasetFactory: DatasetFactory<Quad, Quad>) {
    this.datasetFactory = datasetFactory;
  }

  /**
   * Creates an LdoDataset
   * @param quads - A list of quads to initialize the dataset
   * @returns an LdoDataset
   */
  dataset(quads?: Dataset<Quad, Quad> | Quad[]): LdoDataset {
    return new LdoDataset(
      this.datasetFactory,
      quads
        ? Array.isArray(quads)
          ? this.datasetFactory.dataset(quads)
          : quads
        : undefined,
    );
  }
}
