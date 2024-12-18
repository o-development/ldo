/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TraverserTypes } from "../../";
import type { UnionInstanceNode } from "../../instanceGraph/nodes/UnionInstanceNode";
import type {
  TransformerReturnTypes,
  UnionReturnType,
} from "../TransformerReturnTypes";
import type { UnionTransformerDefinition } from "../Transformers";
import type { UnionTraverserDefinition } from "../../traverser/TraverserDefinition";
import type { UnionType } from "../../traverser/TraverserTypes";
import { transformerParentSubTraverser } from "./TransformerParentSubTraverser";
import type { TransformerSubTraverserGlobals } from "./util/transformerSubTraverserTypes";

export async function transformerUnionSubTraverser<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  ReturnTypes extends TransformerReturnTypes<Types>,
  Type extends UnionType<keyof Types> & Types[TypeName],
  ReturnType extends UnionReturnType,
  Context,
>(
  item: Type["type"],
  itemTypeName: TypeName,
  globals: TransformerSubTraverserGlobals<Types, ReturnTypes, Context>,
): Promise<ReturnType["return"]> {
  const {
    traverserDefinition,
    transformers,
    circularDependencyAwaiter,
    executingPromises,
    superPromise,
  } = globals;
  const resolveSuperPromise = superPromise.add();
  return new Promise<ReturnType["return"]>(async (resolve, reject) => {
    try {
      const definition = traverserDefinition[
        itemTypeName
      ] as UnionTraverserDefinition<Type>;
      const transformer = transformers[
        itemTypeName
      ] as unknown as UnionTransformerDefinition<
        Types,
        TypeName,
        Type,
        ReturnTypes,
        ReturnType,
        Context
      >;
      const transformedObject = await transformer(
        item,
        async () => {
          const itemSpecificTypeName = definition.selector(item);
          const onResolve = circularDependencyAwaiter.add(
            item,
            itemTypeName,
            item,
            itemSpecificTypeName,
            executingPromises,
          );
          const toReturn = await transformerParentSubTraverser(
            item,
            itemSpecificTypeName,
            globals,
          );
          onResolve();
          return toReturn;
        },
        (input) => {
          resolve(input);
        },
        globals.instanceGraph.getNodeFor(
          item,
          itemTypeName,
        ) as unknown as UnionInstanceNode<Types, TypeName, Type>,
        globals.context,
      );
      resolve(transformedObject);
      resolveSuperPromise();
    } catch (err) {
      reject(err);
      resolveSuperPromise(err);
    }
  });
}
