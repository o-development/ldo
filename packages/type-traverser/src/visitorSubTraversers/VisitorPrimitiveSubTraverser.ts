/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PrimitiveVisitorDefinition, TraverserTypes } from "..";
import type { PrimitiveType } from "../TraverserTypes";
import type { VisitorSubTraverserGlobals } from "./util/visitorSubTraverserTypes";

export async function visitorPrimitiveSubTraverser<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  Type extends PrimitiveType,
  Context,
>(
  item: Type["type"],
  itemTypeName: TypeName,
  globals: VisitorSubTraverserGlobals<Types, Context>,
): Promise<void> {
  const { visitors } = globals;
  const visitor = visitors[
    itemTypeName
  ] as unknown as PrimitiveVisitorDefinition<Type, Context>;
  return visitor(item, globals.context);
}
