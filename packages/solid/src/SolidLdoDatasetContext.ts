import type { ResourceStore } from "./ResourceStore";
import type { SolidLdoDataset } from "./SolidLdoDataset";

/**
 * Context to be shared between aspects of a SolidLdoDataset
 */
export interface SolidLdoDatasetContext {
  /**
   * A pointer to the parent SolidLdoDataset
   */
  solidLdoDataset: SolidLdoDataset;
  /**
   * The resource store of the SolidLdoDataset
   */
  resourceStore: ResourceStore;
  /**
   * Http fetch function
   */
  fetch: typeof fetch;
}
