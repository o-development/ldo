import type { IConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";

export interface UseDatasetComposable<Plugin extends ConnectedPlugin> {
  (): IConnectedLdoDataset<Plugin[]>;
}

/**
 * @internal
 *
 * Creates a useDataset function
 */
export function createUseDataset<Plugin extends ConnectedPlugin>(
  dataset: IConnectedLdoDataset<Plugin[]>,
): UseDatasetComposable<Plugin> {
  /**
   * Returns the global dataset for the application
   */
  return function useDataset() {
    return dataset;
  };
}
