import type { Quad } from "@rdfjs/types";
import type { SetProxy, SubjectProxy } from "@ldo/jsonld-dataset-proxy";
import {
  getProxyFromObject,
  _getUnderlyingDataset,
  _proxyContext,
} from "@ldo/jsonld-dataset-proxy";
import type { ITransactionDataset } from "@ldo/subscribable-dataset";
import type { LdoBase } from "./util";
import { isTransactionalDataset } from "./util";

export function getTransactionalDatasetFromLdo(
  ldo: LdoBase,
): [ITransactionDataset<Quad>, SubjectProxy | SetProxy] {
  const proxy = getProxyFromObject(ldo);
  const dataset = proxy[_getUnderlyingDataset];
  if (
    !isTransactionalDataset(dataset) ||
    !proxy[_proxyContext].state.parentDataset
  ) {
    throw new Error("Object is not currently in a transaction");
  }
  return [dataset, proxy];
}
