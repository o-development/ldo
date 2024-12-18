/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TraverserTypes, UnionVisitorDefinition } from "../../";
import type { UnionInstanceNode } from "../../instanceGraph/nodes/UnionInstanceNode";
import type { UnionTraverserDefinition } from "../../traverser/TraverserDefinition";
import type { UnionType } from "../../traverser/TraverserTypes";
import type { VisitorSubTraverserGlobals } from "./util/visitorSubTraverserTypes";
import { visitorParentSubTraverser } from "./VisitorParentSubTraverser";

export async function visitorUnionSubTraverser<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  Type extends UnionType<keyof Types> & Types[TypeName],
  Context,
>(
  item: Type["type"],
  itemTypeName: TypeName,
  globals: VisitorSubTraverserGlobals<Types, Context>,
): Promise<void> {
  const { traverserDefinition, visitors } = globals;
  const definition = traverserDefinition[
    itemTypeName
  ] as UnionTraverserDefinition<Type>;
  const visitor = visitors[itemTypeName] as unknown as UnionVisitorDefinition<
    Types,
    TypeName,
    Type,
    Context
  >;
  const itemSpecificTypeName = definition.selector(item);
  await Promise.all([
    visitor(
      item,
      globals.instanceGraph.getNodeFor(
        item,
        itemTypeName,
      ) as unknown as UnionInstanceNode<Types, TypeName, Type>,
      globals.context,
    ),
    visitorParentSubTraverser(item, itemSpecificTypeName, globals),
  ]);
}
