import type { LdoBase, LdSet, ShapeType } from "@ldo/ldo";
import type { QuadMatch } from "@ldo/rdf-utils";
import type { ConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";

/**
 * @internal
 *
 * Creates a useMatchObject function
 */
export function createUseMatchObject<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
) {
  /**
   * Returns an array of matching items and triggers a rerender when that data
   * is updated.
   */
  return function useMatchObject<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject?: QuadMatch[0] | string,
    predicate?: QuadMatch[1] | string,
    graph?: QuadMatch[3] | string,
  ): LdSet<Type> {
    throw new Error("Not Implemented");
  };
}
