import type { BlankNode, DefaultGraph, Literal, NamedNode } from "@rdfjs/types";
import type { ObjectType } from "../types";

export function nodeToString(
  node: NamedNode | BlankNode | DefaultGraph | Literal | null | undefined,
): string {
  if (node == null) {
    return "null";
  }
  switch (node.termType) {
    case "NamedNode":
      return `namedNode(${node.value})`;
    case "BlankNode":
      return `blankNode(${node.value})`;
    case "Literal":
      return `literal(${node.value},${node.datatype.value})`;
    case "DefaultGraph":
      return "defaultGraph()";
  }
}

export class NodeSet {
  private set: Set<string> = new Set();
  private map: Record<string, ObjectType> = {};

  add(node: ObjectType) {
    const key = nodeToString(node);
    this.set.add(key);
    this.map[key] = node;
  }

  has(node: ObjectType): boolean {
    return this.set.has(nodeToString(node));
  }

  delete(node: ObjectType) {
    const key = nodeToString(node);
    delete this.map[key];
    return this.set.delete(nodeToString(node));
  }

  toArray() {
    return Array.from(this.set).map((stringVal) => {
      return this.map[stringVal];
    });
  }
}
