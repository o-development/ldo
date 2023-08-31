/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TraverserTypes } from "..";
import type {
  InterfaceReturnType,
  TransformerReturnTypes,
} from "../TransformerReturnTypes";
import type { InterfaceTransformerDefinition } from "../Transformers";
import type { InterfaceTraverserDefinition } from "../TraverserDefinition";
import type { InterfaceType } from "../TraverserTypes";
import { transformerParentSubTraverser } from "./TransformerParentSubTraverser";
import type { TransformerSubTraverserGlobals } from "./util/transformerSubTraverserTypes";

export async function transformerInterfaceSubTraverser<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  ReturnTypes extends TransformerReturnTypes<Types>,
  Type extends InterfaceType<keyof Types>,
  ReturnType extends InterfaceReturnType<Type>,
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
      // Get the returns for properties
      const definition = traverserDefinition[
        itemTypeName
      ] as InterfaceTraverserDefinition<Type>;
      const transformer = transformers[
        itemTypeName
      ] as unknown as InterfaceTransformerDefinition<
        Types,
        Type,
        ReturnTypes,
        ReturnType,
        Context
      >;
      const transformedObject = await transformer.transformer(
        item,
        async () => {
          const propertiesReturn: ReturnType["properties"] = Object.fromEntries(
            await Promise.all(
              Object.entries(definition.properties).map(
                async ([propertyName]) => {
                  const originalObject = item[propertyName];
                  const originalPropertyDefinition =
                    definition.properties[propertyName];
                  const transformedProperty = await transformer.properties[
                    propertyName
                  ](
                    originalObject,
                    async () => {
                      if (originalObject === undefined) {
                        return undefined;
                      } else if (Array.isArray(originalObject)) {
                        return Promise.all(
                          originalObject.map(async (subObject) => {
                            const onResolve = circularDependencyAwaiter.add(
                              item,
                              itemTypeName,
                              subObject,
                              originalPropertyDefinition,
                              executingPromises,
                            );
                            const toReturn =
                              await transformerParentSubTraverser(
                                subObject,
                                originalPropertyDefinition,
                                globals as any,
                              );
                            onResolve();
                            return toReturn;
                          }),
                        );
                      } else {
                        const onResolve = circularDependencyAwaiter.add(
                          item,
                          itemTypeName,
                          originalObject,
                          originalPropertyDefinition,
                          executingPromises,
                        );
                        const toReturn = await transformerParentSubTraverser(
                          originalObject,
                          originalPropertyDefinition,
                          globals as any,
                        );
                        onResolve();
                        return toReturn;
                      }
                    },
                    globals.context,
                  );
                  return [propertyName, transformedProperty];
                },
              ),
            ),
          );
          return propertiesReturn;
        },
        (input) => {
          resolve(input);
        },
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
