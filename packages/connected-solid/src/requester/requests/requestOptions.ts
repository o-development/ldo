import type { IBulkEditableDataset } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";

/**
 * Request Options to be passed to request functions
 */
export interface BasicRequestOptions {
  /**
   * A fetch function, usually an authenticated Solid OIDC fetch.
   */
  fetch?: typeof fetch;
}

/**
 * Request options with a dataset component
 */
export interface DatasetRequestOptions extends BasicRequestOptions {
  /**
   * A dataset to be modified with any new information obtained from a request
   */
  dataset?: IBulkEditableDataset<Quad>;
}
