import type {
  SubjectNode,
  PredicateNode,
  ObjectNode,
  GraphNode,
} from "@ldo/rdf-utils";
import type { Quad } from "@rdfjs/types";
import type { RawObject } from "../util/RawObject";
import { SetProxy } from "./SetProxy";
import type { ProxyContext } from "../ProxyContext";
import { getNodeFromRawObject } from "../util/getNodeFromRaw";
import { _isSubjectOriented } from "../types";

export type WildcardSubjectSetProxyQuadMatch = [
  undefined | null,
  PredicateNode | undefined | null,
  ObjectNode | undefined | null,
  GraphNode | undefined | null,
];

/**
 * A WildcardObjectProxy represents a set of nodes in a dataset that are all the
 * object of a given subject and predicate. Because this is a wildcard, the
 * subject and predicate don't necissarily need to be defined.
 */
export class WildcardSubjectSetProxy<T extends RawObject> extends SetProxy<T> {
  protected quadMatch: WildcardSubjectSetProxyQuadMatch;

  constructor(
    context: ProxyContext,
    quadMatch: WildcardSubjectSetProxyQuadMatch,
  ) {
    super(context, quadMatch);
    this.quadMatch = quadMatch;
  }

  protected getSPOG(value?: T | undefined): {
    subject?: SubjectNode;
    predicate?: PredicateNode;
    object?: ObjectNode;
    graph?: GraphNode;
  } {
    // Get the RDF Node that represents the value, skip is no value
    const predicate = this.quadMatch[1] ?? undefined;
    const object = this.quadMatch[2] ?? undefined;
    const graph = this.quadMatch[3] ?? undefined;
    if (value) {
      const valueNode = getNodeFromRawObject(value, this.context.contextUtil);
      return {
        subject: valueNode,
        predicate,
        object,
        graph,
      };
    }
    // SPO for no value
    return {
      subject: undefined,
      predicate,
      object,
      graph,
    };
  }

  protected getNodeOfFocus(quad: Quad): SubjectNode {
    return quad.subject as SubjectNode;
  }

  get [_isSubjectOriented](): true {
    return true;
  }
}
