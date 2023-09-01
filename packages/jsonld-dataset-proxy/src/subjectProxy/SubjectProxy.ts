import type { BlankNode, Dataset, NamedNode, GraphNode } from "@ldo/rdf-utils";
import type { ContextDefinition } from "jsonld";
import type { ProxyContext } from "../ProxyContext";
import type {
  _getUnderlyingDataset,
  _getUnderlyingNode,
  _proxyContext,
  _writeGraphs,
} from "../types";

export type SubjectProxy = {
  "@id"?: string;
  "@context": ContextDefinition;
  readonly [key: string | number | symbol]: unknown;
  readonly [_getUnderlyingDataset]: Dataset;
  readonly [_getUnderlyingNode]: NamedNode | BlankNode;
  [_proxyContext]: ProxyContext;
  readonly [_writeGraphs]: GraphNode[];
};
