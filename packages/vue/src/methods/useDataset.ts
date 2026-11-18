import type { IConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";

export interface UseDatasetComposable<Plugins extends ConnectedPlugin[]> {
  (): IConnectedLdoDataset<Plugins>;
}

/**
 * @internal
 *
 * Creates a useDataset function
 */
export function createUseDataset<Plugins extends ConnectedPlugin[]>(
  dataset: IConnectedLdoDataset<Plugins>,
): UseDatasetComposable<Plugins> {
  /**
   * Returns the global dataset for the application
   */
  return function useDataset() {
    return dataset;
  };
}
