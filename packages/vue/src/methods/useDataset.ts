import type { IConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";

/**
 * @internal
 *
 * Creates a useDataset function
 */
export function createUseDataset<Plugins extends ConnectedPlugin[]>(
  dataset: IConnectedLdoDataset<Plugins>,
) {
  /**
   * Returns the global dataset for the application
   */
  return function useDataset() {
    return dataset;
  };
}
