import { namedNode } from "@rdfjs/data-model";
import type { Dataset, Quad } from "@rdfjs/types";
import type { ArrayProxy, SubjectProxy } from "@ldo/jsonld-dataset-proxy";
import {
  getProxyFromObject,
  _getUnderlyingDataset,
  _proxyContext,
} from "@ldo/jsonld-dataset-proxy";
import type { AnyNode } from "@ldo/rdf-utils";
import type {
  SubscribableDataset,
  TransactionalDataset,
} from "@ldo/subscribable-dataset";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LdoBase = Record<string, any>;

/**
 * Converts a node/string into just a node
 * @param input A Node or string
 * @returns A node
 */
export function normalizeNodeName<NodeType extends AnyNode>(
  input: NodeType | string,
): NodeType {
  return (typeof input === "string" ? namedNode(input) : input) as NodeType;
}

/**
 * Converts an array of nodes/strings into an array of nodes
 * @param inputs An array of nodes/strings
 * @returns An array of nodes
 */
export function normalizeNodeNames<NodeType extends AnyNode>(
  inputs: (NodeType | string)[],
): NodeType[] {
  return inputs.map((input) => normalizeNodeName<NodeType>(input));
}

export function canDatasetStartTransaction(
  dataset: Dataset,
): dataset is SubscribableDataset<Quad> {
  return (
    typeof (dataset as SubscribableDataset).startTransaction === "function"
  );
}

export function isTransactionalDataset(
  dataset: Dataset,
): dataset is TransactionalDataset<Quad> {
  return typeof (dataset as TransactionalDataset).commit === "function";
}

export function getTransactionalDatasetFromLdo(
  ldo: LdoBase,
): [TransactionalDataset<Quad>, SubjectProxy | ArrayProxy] {
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
