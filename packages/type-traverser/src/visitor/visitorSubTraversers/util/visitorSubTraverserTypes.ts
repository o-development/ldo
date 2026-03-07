/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  BaseTraverserTypes,
  TraverserTypes,
} from "../../../traverser/TraverserTypes";
import type { InstanceGraph } from "../../../instanceGraph/InstanceGraph";
import type { MultiSet } from "../../../transformer/transformerSubTraversers/util/MultiSet";
import type { TraverserDefinitions } from "../../../traverser/TraverserDefinition";
import type { Visitors } from "../../Visitors";

export type VisitorSubTraverser<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  Type extends BaseTraverserTypes<keyof Types>,
  Context,
> = (
  item: Type["type"],
  itemTypeName: TypeName,
  globals: VisitorSubTraverserGlobals<Types, Context>,
) => Promise<void>;

export interface VisitorSubTraverserGlobals<
  Types extends TraverserTypes<any>,
  Context,
> {
  traverserDefinition: TraverserDefinitions<Types>;
  visitors: Visitors<Types, Context>;
  visitedObjects: MultiSet<object, keyof Types>;
  instanceGraph: InstanceGraph<Types>;
  context: Context;
}
