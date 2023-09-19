import type { Dataset, Quad } from "@rdfjs/types";

export interface BasicRequestOptions {
  fetch?: typeof fetch;
}

export interface DatasetRequestOptions extends BasicRequestOptions {
  dataset?: Dataset<Quad>;
}
