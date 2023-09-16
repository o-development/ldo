import type { TransactionalDataset } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";

export interface RequestParams {
  uri: string;
  fetch: typeof fetch;
  transaction: TransactionalDataset<Quad>;
}

export type SimpleRequestParams = Omit<RequestParams, "transaction">;
