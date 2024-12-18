/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TraverserTypes } from "../../";
import type { PrimitiveInstanceNode } from "../../instanceGraph/nodes/PrimitiveInstanceNode";
import type {
  PrimitiveReturnType,
  TransformerReturnTypes,
} from "../TransformerReturnTypes";
import type { PrimitiveTransformerDefinition } from "../Transformers";
import type { PrimitiveType } from "../../traverser/TraverserTypes";
import type { TransformerSubTraverserGlobals } from "./util/transformerSubTraverserTypes";

export async function transformerPrimitiveSubTraverser<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  ReturnTypes extends TransformerReturnTypes<Types>,
  Type extends PrimitiveType & Types[TypeName],
  ReturnType extends PrimitiveReturnType,
  Context,
>(
  item: Type["type"],
  itemTypeName: TypeName,
  globals: TransformerSubTraverserGlobals<Types, ReturnTypes, Context>,
): Promise<ReturnType["return"]> {
  const { transformers } = globals;
  const transformer = transformers[
    itemTypeName
  ] as unknown as PrimitiveTransformerDefinition<
    Types,
    TypeName,
    Type,
    ReturnType,
    Context
  >;
  return transformer(
    item,
    globals.instanceGraph.getNodeFor(
      item,
      itemTypeName,
    ) as unknown as PrimitiveInstanceNode<Types, TypeName, Type>,
    globals.context,
  );
}
