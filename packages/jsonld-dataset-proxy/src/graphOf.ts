import type { ObjectNode, GraphNode } from "@ldo/rdf-utils";
import { namedNode } from "@rdfjs/data-model";
import { getSubjectProxyFromObject } from "./subjectProxy/isSubjectProxy";
import type { ObjectLike } from "./types";
import {
  _getUnderlyingDataset,
  _getUnderlyingMatch,
  _getUnderlyingNode,
  _proxyContext,
} from "./types";

/**
 * Returns the graph for which a defined triple is a member
 * @param subject A JsonldDatasetProxy that represents the subject
 * @param predicate The key on the JsonldDatasetProxy
 * @param object The direct object. This can be a JsonldDatasetProxy. This field
 * is optional if this field does not have a "set" object.
 * @returns a list of graphs for which the triples are members
 */
export function graphOf<Subject extends ObjectLike, Key extends keyof Subject>(
  subject: Subject,
  predicate: Key,
  object: NonNullable<Subject[Key]> extends Set<infer T>
    ? T
    : Subject[Key] | undefined,
): GraphNode[] {
  const subjectProxy = getSubjectProxyFromObject(subject);
  const proxyContext = subjectProxy[_proxyContext];
  const subjectNode = subjectProxy[_getUnderlyingNode];
  const predicateNode = namedNode(
    proxyContext.contextUtil.keyToIri(
      predicate as string,
      proxyContext.getRdfType(subjectNode),
    ),
  );
  let objectNode: ObjectNode | null;
  if (object == null) {
    objectNode = null;
  } else {
    const objectProxy = getSubjectProxyFromObject(object);
    objectNode = objectProxy[_getUnderlyingNode];
  }
  const quads = subjectProxy[_getUnderlyingDataset].match(
    subjectNode,
    predicateNode,
    objectNode,
  );
  return quads.toArray().map((quad): GraphNode => quad.graph as GraphNode);
}
