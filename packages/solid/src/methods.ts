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

/**
 * Begins tracking changes to eventually commit
 * @param input A linked data object to track changes on
 * @param resources
 */
export function changeData<Type extends LdoBase>(
  input: Type,
  ...resources: Resource[]
): Type {
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
  const dataset = getDataset(input) as SolidLdoDataset;
  return dataset.commitChangesToPod(changes as DatasetChanges<Quad>);
}
