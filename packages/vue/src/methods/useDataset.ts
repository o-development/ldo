import type { IConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";

/**
 * @internal
 *
 * Creates a useDataset function
 */
export function createUseDataset<Plugin extends ConnectedPlugin>(
  dataset: IConnectedLdoDataset<Plugin[]>,
) {
  /**
   * Returns the global dataset for the application
   */
  return function useDataset() {
    return dataset;
  };
}
