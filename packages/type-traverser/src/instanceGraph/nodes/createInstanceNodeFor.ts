/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  InterfaceType,
  PrimitiveType,
  TraverserTypes,
  UnionType,
} from "../../TraverserTypes";
import type { InstanceGraph } from "../instanceGraph";
import { InterfaceInstanceNode } from "./InterfaceInstanceNode";
import { PrimitiveInstanceNode } from "./PrimitiveInstanceNode";
import { UnionInstanceNode } from "./UnionInstanceNode";

export type InstanceNodeFor<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
> = Types[TypeName] extends InterfaceType<keyof Types>
  ? InterfaceInstanceNode<Types, TypeName, Types[TypeName]>
  : Types[TypeName] extends UnionType<keyof Types>
  ? UnionInstanceNode<Types, TypeName, Types[TypeName]>
  : Types[TypeName] extends PrimitiveType
  ? PrimitiveInstanceNode<Types, TypeName, Types[TypeName]>
  : never;

export function createInstanceNodeFor<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
>(
  instance: unknown,
  typeName: TypeName,
  graph: InstanceGraph<Types>,
): InstanceNodeFor<Types, TypeName> {
  switch (graph.traverserDefinitions[typeName].kind) {
    case "interface":
      return new InterfaceInstanceNode(
        graph,
        instance,
        typeName,
      ) as InstanceNodeFor<Types, TypeName>;
    case "union":
      return new UnionInstanceNode(
        graph,
        instance,
        typeName,
      ) as InstanceNodeFor<Types, TypeName>;
    case "primitive":
      return new PrimitiveInstanceNode(
        graph,
        instance,
        typeName,
      ) as InstanceNodeFor<Types, TypeName>;
  }
}
