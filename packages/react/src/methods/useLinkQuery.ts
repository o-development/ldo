import type { ConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";
import type { LdoBase } from "@ldo/ldo";
import type { SubjectNode } from "@ldo/rdf-utils";
import type { LQInput } from "packages/connected/dist/types/ILinkQuery";

/**
 * @internal
 *
 * Creates a useMatchSubject function.
 */
export function createUseQueryLink<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
) {
  /**
   * Returns an array of matching linked data objects. Triggers a rerender if
   * the data is updated.
   */
  return function useQueryLink<
    Type extends LdoBase,
    QueryInput extends LQInput<Type>,
  >(
    shapeType: ShapeType<Type>,
    startingResource: string,
    startingSubject: SubjectNode | string,
    linkQuery: QueryInput,
  ): ExpandDeep<LQReturn<Type, QueryInput>> | undefined {};
}
