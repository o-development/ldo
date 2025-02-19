import type { GraphNode, PredicateNode, SubjectNode } from "@ldo/rdf-utils";
import type { RawObject, RawValue } from "../util/RawObject";
import { WildcardObjectSetProxy } from "./WildcardObjectSetProxy";
import { addObjectToDataset } from "../util/addObjectToDataset";
import type { ProxyContext } from "../ProxyContext";

export type ObjectSetProxyQuadMatch = [
  SubjectNode,
  PredicateNode,
  undefined | null,
  GraphNode | undefined | null,
];

export class ObjectSetProxy<
  T extends NonNullable<RawValue>,
> extends WildcardObjectSetProxy<T> {
  protected quadMatch: ObjectSetProxyQuadMatch;

  constructor(context: ProxyContext, quadMatch: ObjectSetProxyQuadMatch) {
    super(context, quadMatch);
    this.quadMatch = quadMatch;
  }

  /**
   * Appends a new element with a specified value to the end of the Set.
   */
  add(value: T): this {
    addObjectToDataset(
      {
        "@id": this.quadMatch[0],
        [this.context.contextUtil.iriToKey(
          this.quadMatch[1].value,
          this.context.getRdfType(this.quadMatch[0]),
        )]: value,
      } as RawObject,
      false,
      this.context,
    );
    return this;
  }
}
