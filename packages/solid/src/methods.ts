import {
  startTransaction,
  type LdoBase,
  write,
  transactionChanges,
  getDataset,
} from "@ldo/ldo";
import type { DatasetChanges } from "@ldo/rdf-utils";
import type { Resource } from "./resource/Resource";
import type { SolidLdoDataset } from "./SolidLdoDataset";
import type { Quad } from "@rdfjs/types";
import { _proxyContext, getProxyFromObject } from "@ldo/jsonld-dataset-proxy";
import type { SubscribableDataset } from "@ldo/subscribable-dataset";

/**
 * Begins tracking changes to eventually commit
 * @param input A linked data object to track changes on
 * @param resources
 */
export function changeData<Type extends LdoBase>(
  input: Type,
  resource: Resource,
  ...additionalResources: Resource[]
): Type {
  const resources = [resource, ...additionalResources];
  // Clone the input and set a graph
  const [transactionLdo] = write(...resources.map((r) => r.uri)).usingCopy(
    input,
  );
  // Start a transaction with the input
  startTransaction(transactionLdo);
  // Return
  return transactionLdo;
}

/**
 * Commits the transaction to the global dataset, syncing all subscribing
 * components and Solid Pods
 */
export function commitData(
  input: LdoBase,
): ReturnType<SolidLdoDataset["commitChangesToPod"]> {
  const changes = transactionChanges(input);
  // Take the LdoProxy out of commit mode. This uses hidden methods of JSONLD-DATASET-PROXY
  const proxy = getProxyFromObject(input);
  proxy[_proxyContext] = proxy[_proxyContext].duplicate({
    dataset: proxy[_proxyContext].state
      .parentDataset as SubscribableDataset<Quad>,
  });
  const dataset = getDataset(input) as SolidLdoDataset;
  return dataset.commitChangesToPod(changes as DatasetChanges<Quad>);
}
