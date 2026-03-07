import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import { createDataset } from "@ldo/dataset";
import { SubscribableDatasetFactory } from "./SubscribableDatasetFactory";
import type {
  ISubscribableDataset,
  ISubscribableDatasetFactory,
  ITransactionDatasetFactory,
} from "./types";
import { TransactionDatasetFactory } from "./TransactionDatasetFactory";

const datasetFactory: DatasetFactory<Quad> = {
  dataset: (quads?: Dataset<Quad> | Quad[]): Dataset<Quad> => {
    return createDataset(quads);
  },
};

/**
 * Creates a factory that generates TransactionDatasets
 * @returns TransactionDatasetFactory
 */
export function createTransactionDatasetFactory(): ITransactionDatasetFactory<Quad> {
  return new TransactionDatasetFactory(datasetFactory);
}

/**
 * Creates a dataset factory that generates a SubscribableDataset
 * @returns DatasetFactory for SubscribableDataset
 */
export function createSubscribableDatasetFactory(): ISubscribableDatasetFactory<Quad> {
  return new SubscribableDatasetFactory(
    datasetFactory,
    createTransactionDatasetFactory(),
  );
}

/**
 * Creates a SubscribableDataset
 * @param quads: A dataset or array of Quads to initialize the dataset.
 * @returns Dataset
 */
export function createSubscribableDataset(
  quads?: Dataset<Quad> | Quad[],
): ISubscribableDataset<Quad> {
  const subscribableDatasetFactory = createSubscribableDatasetFactory();
  return subscribableDatasetFactory.dataset(quads);
}
