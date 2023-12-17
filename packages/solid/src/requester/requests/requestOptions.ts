import type { BulkEditableDataset } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";

export interface BasicRequestOptions {
  fetch?: typeof fetch;
}

export interface DatasetRequestOptions extends BasicRequestOptions {
  dataset?: BulkEditableDataset<Quad>;
}
