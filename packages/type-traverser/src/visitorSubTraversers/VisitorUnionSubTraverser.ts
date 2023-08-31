/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TraverserTypes, UnionVisitorDefinition } from "..";
import type { UnionTraverserDefinition } from "../TraverserDefinition";
import type { UnionType } from "../TraverserTypes";
import type { VisitorSubTraverserGlobals } from "./util/visitorSubTraverserTypes";
import { visitorParentSubTraverser } from "./VisitorParentSubTraverser";

export async function visitorUnionSubTraverser<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  Type extends UnionType<keyof Types>,
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
    Type,
    Context
  >;
  const itemSpecificTypeName = definition.selector(item);
  await Promise.all([
    visitor(item, globals.context),
    visitorParentSubTraverser(item, itemSpecificTypeName, globals),
  ]);
}
