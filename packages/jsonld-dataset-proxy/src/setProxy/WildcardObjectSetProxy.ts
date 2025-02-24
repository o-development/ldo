import type {
  SubjectNode,
  PredicateNode,
  ObjectNode,
  GraphNode,
} from "@ldo/rdf-utils";
import type { Dataset, Quad } from "@rdfjs/types";
import type { RawValue } from "../util/RawObject";
import { SetProxy } from "./SetProxy";
import type { ProxyContext } from "../ProxyContext";
import { getNodeFromRawValue } from "../util/getNodeFromRaw";
import { _isSubjectOriented } from "../types";

export type WildcardObjectSetProxyQuadMatch = [
  SubjectNode | undefined | null,
  PredicateNode | undefined | null,
  undefined | null,
  GraphNode | undefined | null,
];

/**
 * A WildcardObjectProxy represents a set of nodes in a dataset that are all the
 * object of a given subject and predicate. Because this is a wildcard, the
 * subject and predicate don't necissarily need to be defined.
 */
export class WildcardObjectSetProxy<
  T extends NonNullable<RawValue>,
> extends SetProxy<T> {
  protected quadMatch: WildcardObjectSetProxyQuadMatch;

  constructor(
    context: ProxyContext,
    quadMatch: WildcardObjectSetProxyQuadMatch,
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
    const subject = this.quadMatch[0] ?? undefined;
    const predicate = this.quadMatch[1] ?? undefined;
    const graph = this.quadMatch[3] ?? undefined;
    if (value) {
      // Get datatype if applicable
      let datatype: string | undefined = undefined;
      if (this.quadMatch[0] && predicate) {
        const rdfType = this.context.getRdfType(this.quadMatch[0]);
        const key = this.context.contextUtil.iriToKey(predicate.value, rdfType);
        datatype = this.context.contextUtil.getDataType(key, rdfType);
      }
      const valueNode = getNodeFromRawValue(value, this.context, datatype);
      return {
        subject,
        predicate,
        object: valueNode,
        graph,
      };
    }
    // SPO for no value
    return {
      subject,
      predicate,
      object: undefined,
      graph,
    };
  }

  protected getNodeOfFocus(quad: Quad): ObjectNode {
    return quad.object as ObjectNode;
  }

  private manuallyMatchWithUnknownObjectNode(
    subject: SubjectNode | undefined,
    predicate: PredicateNode | undefined,
    graph: GraphNode | undefined,
    value: T,
  ): Dataset<Quad, Quad> {
    // If there's not an object, that means that we don't know the object node
    // and need to find it manually.
    const matchingQuads = this.context.dataset.match(
      subject,
      predicate,
      null,
      graph,
    );
    return matchingQuads.filter(
      (quad) =>
        quad.object.termType === "Literal" && quad.object.value === value,
    );
  }

  delete(value: T): boolean {
    const { dataset } = this.context;
    const { subject, predicate, object, graph } = this.getSPOG(value);
    if (!object) {
      const matchedQuads = this.manuallyMatchWithUnknownObjectNode(
        subject,
        predicate,
        graph,
        value,
      );
      matchedQuads.forEach((quad) => dataset.delete(quad));
      return matchedQuads.size > 0;
    } else {
      const willDelete =
        dataset.match(subject, predicate, object, graph).size > 0;
      dataset.deleteMatches(subject, predicate, object, graph);
      return willDelete;
    }
  }

  has(value: T): boolean {
    const { dataset } = this.context;
    const { subject, predicate, object, graph } = this.getSPOG(value);
    if (!object) {
      return (
        this.manuallyMatchWithUnknownObjectNode(
          subject,
          predicate,
          graph,
          value,
        ).size > 0
      );
    } else {
      return dataset.match(subject, predicate, object, graph).size > 0;
    }
  }

  get [_isSubjectOriented](): false {
    return false;
  }
}
