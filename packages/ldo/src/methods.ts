import type { JsonLdDocument } from "jsonld";
import type { GraphNode, DatasetChanges } from "@ldo/rdf-utils";
import type { InteractOptions } from "@ldo/jsonld-dataset-proxy";
import {
  getProxyFromObject,
  _getUnderlyingDataset,
  _proxyContext,
  write as writeDependency,
} from "@ldo/jsonld-dataset-proxy";
import type { SubscribableDataset } from "@ldo/subscribable-dataset";
import type { WriterOptions } from "@ldo/rdf-utils";
import type { Dataset, Quad } from "@rdfjs/types";
import { changesToSparqlUpdate, datasetToString } from "@ldo/rdf-utils";
import type { LdoBase } from "./util";
import {
  canDatasetStartTransaction,
  getTransactionalDatasetFromLdo,
  normalizeNodeNames,
} from "./util";

export {
  graphOf,
  languagesOf,
  setLanguagePreferences,
} from "@ldo/jsonld-dataset-proxy";

export function write(...graphs: (GraphNode | string)[]): InteractOptions {
  return writeDependency(...normalizeNodeNames(graphs));
}

/**
 * Begins a transaction for the given linked data object
 * @param ldo
 */
export function startTransaction(ldo: LdoBase): void {
  const proxy = getProxyFromObject(ldo);
  const dataset = proxy[_getUnderlyingDataset];
  if (!canDatasetStartTransaction(dataset)) {
    throw new Error("Object is not transactable.");
  }
  proxy[_proxyContext] = proxy[_proxyContext].duplicate({
    dataset: (dataset as SubscribableDataset<Quad>).startTransaction(),
    state: { parentDataset: dataset },
  });
}

/**
 * Ends a transaction and commits the
 * @param ldo
 */
export function commitTransaction(ldo: LdoBase): void {
  const [dataset, proxy] = getTransactionalDatasetFromLdo(ldo);
  dataset.commit();
  proxy[_proxyContext] = proxy[_proxyContext].duplicate({
    dataset: proxy[_proxyContext].state
      .parentDataset as SubscribableDataset<Quad>,
  });
}

export function transactionChanges(ldo: LdoBase): DatasetChanges<Quad> {
  const [dataset] = getTransactionalDatasetFromLdo(ldo);
  return dataset.getChanges();
}

export function getDataset(ldo: LdoBase): Dataset {
  const proxy = getProxyFromObject(ldo);
  return proxy[_getUnderlyingDataset];
}

export async function toSparqlUpdate(ldo: LdoBase): Promise<string> {
  const [dataset] = getTransactionalDatasetFromLdo(ldo);
  const changes = dataset.getChanges();
  return changesToSparqlUpdate(changes);
}

export async function serialize(
  ldo: LdoBase,
  options: WriterOptions,
): Promise<string> {
  const dataset = getProxyFromObject(ldo)[_getUnderlyingDataset];
  return datasetToString(dataset, options);
}

export async function toTurtle(ldo: LdoBase): Promise<string> {
  const dataset = getProxyFromObject(ldo)[_getUnderlyingDataset];
  return datasetToString(dataset, {});
}

export async function toJsonLd(_ldo: LdoBase): Promise<JsonLdDocument> {
  throw new Error("Not Implemented");
}

export async function toNTriples(ldo: LdoBase): Promise<string> {
  const dataset = getProxyFromObject(ldo)[_getUnderlyingDataset];
  return datasetToString(dataset, { format: "N-Triples" });
}
