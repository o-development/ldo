import type { JsonLdDocument } from "jsonld";
import type { GraphNode, SubjectNode, WriterOptions } from "@ldo/rdf-utils";
import { datasetToString } from "@ldo/rdf-utils";
import type { DatasetCore } from "@rdfjs/types";
import type { TermWrapper } from "@rdfjs/wrapper";
import { LdoTermWrapper } from "./LdoTermWrapper";

/**
 * Returns the underlying DatasetCore of a TermWrapper-based Linked Data Object.
 *
 * @param ldo - Any Linked Data Object (TermWrapper subclass)
 * @returns The DatasetCore backing the given LDO
 *
 * @example
 * ```typescript
 * import { getDataset } from "@ldo/ldo"
 * const dataset = getDataset(profile);
 * ```
 */
export function getDataset(ldo: TermWrapper): DatasetCore {
  return ldo instanceof LdoTermWrapper ? ldo.underlyingDataset : ldo.dataset;
}

/**
 * Returns the underlying RDF subject term of a Linked Data Object.
 *
 * @param ldo - Any Linked Data Object (TermWrapper subclass)
 * @returns A NamedNode or BlankNode representing the subject
 *
 * @example
 * ```typescript
 * import { getRdfNode } from "@ldo/ldo"
 * const profileNode = getRdfNode(profile);
 * // Logs: https://example.com/profile/card#me
 * console.log(profileNode.value);
 * ```
 */
export function getRdfNode(ldo: TermWrapper): SubjectNode {
  if (ldo.termType === "BlankNode") {
    return ldo.factory.blankNode(ldo.value) as SubjectNode;
  }
  return ldo.factory.namedNode(ldo.value) as SubjectNode;
}

/**
 * Returns the named graph(s) in which the given predicate IRI is asserted for
 * the LDO's subject. Useful for inspecting which graph a write landed in after
 * using `LdoBuilder.write(graph).fromSubject(...)`.
 *
 * @param ldo - Any Linked Data Object (TermWrapper subclass)
 * @param predicateIri - The full IRI of the predicate to look up
 * @returns An array of graph Terms (named nodes or default graph) — deduplicated
 *
 * @example
 * ```typescript
 * import { graphOf } from "@ldo/ldo"
 * const graphs = graphOf(profile, "http://xmlns.com/foaf/0.1/name");
 * ```
 */
export function graphOf(ldo: TermWrapper, predicateIri: string): GraphNode[] {
  const store =
    ldo instanceof LdoTermWrapper ? ldo.underlyingDataset : ldo.dataset;
  const subjectTerm =
    ldo.termType === "BlankNode"
      ? ldo.factory.blankNode(ldo.value)
      : ldo.factory.namedNode(ldo.value);
  const seen = new Map<string, GraphNode>();
  for (const q of store.match(
    subjectTerm,
    ldo.factory.namedNode(predicateIri),
  )) {
    const key = q.graph.termType + ":" + q.graph.value;
    if (!seen.has(key)) seen.set(key, q.graph as GraphNode);
  }
  return [...seen.values()];
}

/**
 * Converts a Linked Data Object to a Turtle string.
 *
 * @param ldo - Any Linked Data Object
 * @returns Serialized Turtle
 *
 * @example
 * ```typescript
 * import { toTurtle } from "@ldo/ldo"
 * const rawTurtle: string = await toTurtle(profile);
 * ```
 */
export async function toTurtle(ldo: TermWrapper): Promise<string> {
  return datasetToString(ldo.dataset, {});
}

export async function toJsonLd(_ldo: TermWrapper): Promise<JsonLdDocument> {
  throw new Error("Not Implemented");
}

/**
 * Converts a Linked Data Object to an N-Triples string.
 *
 * @param ldo - Any Linked Data Object
 * @returns An N-Triple string
 *
 * @example
 * ```typescript
 * import { toNTriples } from "@ldo/ldo"
 * const rawNTriples: string = await toNTriples(profile);
 * ```
 */
export async function toNTriples(ldo: TermWrapper): Promise<string> {
  return datasetToString(ldo.dataset, { format: "N-Triples" });
}

/**
 * Converts a Linked Data Object to a string representation using the provided
 * N3 writer options.
 *
 * @param ldo - Any Linked Data Object
 * @param options - WriterOptions from N3
 *
 * @example
 * ```typescript
 * import { serialize } from "@ldo/ldo"
 * const rawTurtle: string = await serialize(profile, { format: "Turtle" });
 * ```
 */
export async function serialize(
  ldo: TermWrapper,
  options: WriterOptions,
): Promise<string> {
  return datasetToString(ldo.dataset, options);
}
