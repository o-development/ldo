import type { GraphNode, ObjectNode, PredicateNode } from "@ldo/rdf-utils";
import type { RawObject } from "../util/RawObject";
import { addObjectToDataset } from "../util/addObjectToDataset";
import type { ProxyContext } from "../ProxyContext";
import { WildcardSubjectSetProxy } from "./WildcardSubjectSetProxy";
import { _getUnderlyingNode } from "../types";
import { quad } from "@rdfjs/data-model";

export type SubjectSetProxyQuadMatch = [
  undefined | null,
  PredicateNode,
  ObjectNode,
  GraphNode | undefined | null,
];

export class SubjectSetProxy<
  T extends RawObject,
> extends WildcardSubjectSetProxy<T> {
  protected quadMatch: SubjectSetProxyQuadMatch;

  constructor(context: ProxyContext, quadMatch: SubjectSetProxyQuadMatch) {
    super(context, quadMatch);
    this.quadMatch = quadMatch;
  }

  /**
   * Appends a new element with a specified value to the end of the Set.
   */
  add(value: T): this {
    const added = addObjectToDataset(value as RawObject, false, this.context);
    const addedNode = added[_getUnderlyingNode];
    this.context.writeGraphs.forEach((graph) => {
      this.context.dataset.add(
        quad(addedNode, this.quadMatch[1], this.quadMatch[2], graph),
      );
    });
    return this;
  }
}
