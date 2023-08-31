import type { BlankNode, DefaultGraph, Literal, NamedNode } from "@rdfjs/types";

export const _getUnderlyingNode = Symbol("_getUnderlyingNode");
export const _getUnderlyingMatch = Symbol("_getUnderlyingMatch");
export const _isSubjectOriented = Symbol("_isSubjectOriented");
export const _getNodeAtIndex = Symbol("_getNodeAtIndex");
export const _getUnderlyingDataset = Symbol("_getUnderlyingDataset");
export const _getUnderlyingArrayTarget = Symbol("_getUnderlyingArrayTarget");
export const _proxyContext = Symbol("_proxyContext");
export const _writeGraphs = Symbol("_writeGraphs");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectLike = Record<string | number | symbol, any>;

export type SubjectType = NamedNode | BlankNode;
export type PredicateType = NamedNode;
export type ObjectType = NamedNode | BlankNode | Literal;
export type GraphType = NamedNode | BlankNode | DefaultGraph;

export type QuadMatch = [
  SubjectType | undefined | null,
  PredicateType | undefined | null,
  ObjectType | undefined | null,
  GraphType | undefined | null,
];
