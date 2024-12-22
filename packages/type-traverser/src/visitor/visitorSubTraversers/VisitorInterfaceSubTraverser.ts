/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InterfaceVisitorDefinition, TraverserTypes } from "../../";
import type { InterfaceInstanceNode } from "../../instanceGraph/nodes/InterfaceInstanceNode";
import type { InterfaceTraverserDefinition } from "../../traverser/TraverserDefinition";
import type { InterfaceType } from "../../traverser/TraverserTypes";
import type { VisitorSubTraverserGlobals } from "./util/visitorSubTraverserTypes";
import { visitorParentSubTraverser } from "./VisitorParentSubTraverser";

export async function visitorInterfaceSubTraverser<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  Type extends InterfaceType<keyof Types> & Types[TypeName],
  Context,
>(
  item: Type["type"],
  itemTypeName: TypeName,
  globals: VisitorSubTraverserGlobals<Types, Context>,
): Promise<void> {
  const { traverserDefinition, visitors } = globals;
  // Get the returns for properties
  const definition = traverserDefinition[
    itemTypeName
  ] as InterfaceTraverserDefinition<Type>;
  const visitor = visitors[
    itemTypeName
  ] as unknown as InterfaceVisitorDefinition<Types, TypeName, Type, Context>;

  await Promise.all([
    visitor.visitor(
      item,
      globals.instanceGraph.getNodeFor(
        item,
        itemTypeName,
      ) as unknown as InterfaceInstanceNode<Types, TypeName, Type>,
      globals.context,
    ),
    Promise.all(
      Object.entries(definition.properties).map(async ([propertyName]) => {
        const originalObject = item[propertyName];
        const originalPropertyDefinition = definition.properties[propertyName];
        const propertyVisitorPromise = visitor.properties[propertyName](
          originalObject,
          globals.instanceGraph.getNodeFor(
            item,
            itemTypeName,
          ) as unknown as InterfaceInstanceNode<Types, TypeName, Type>,
          globals.context,
        );
        let propertyTraverserPromise: Promise<void | void[]>;
        if (originalObject === undefined) {
          propertyTraverserPromise = Promise.resolve();
        } else if (Array.isArray(originalObject)) {
          propertyTraverserPromise = Promise.all(
            originalObject.map(async (subObject) => {
              await visitorParentSubTraverser(
                subObject,
                originalPropertyDefinition,
                globals as any,
              );
            }),
          );
        } else {
          propertyTraverserPromise = visitorParentSubTraverser(
            originalObject,
            originalPropertyDefinition,
            globals as any,
          );
        }
        return Promise.all([propertyVisitorPromise, propertyTraverserPromise]);
      }),
    ),
  ]);
}
