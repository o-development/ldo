import type { DatasetFactory, Dataset, Quad } from "@rdfjs/types";
import { LdoDataset } from "./LdoDataset";

/**
 * A DatasetFactory that creates an ExtendedDataset given a DatasetCoreFactory.
 */
export class LdoDatasetFactory implements DatasetFactory<Quad, Quad> {
  private datasetFactory: DatasetFactory<Quad, Quad>;
  constructor(datasetFactory: DatasetFactory<Quad, Quad>) {
    this.datasetFactory = datasetFactory;
  }

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
