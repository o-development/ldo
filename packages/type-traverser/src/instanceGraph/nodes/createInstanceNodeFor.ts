/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  InterfaceType,
  PrimitiveType,
  TraverserTypes,
  UnionType,
} from "../../traverser/TraverserTypes";
import type { InstanceGraph } from "../InstanceGraph";
import { InterfaceInstanceNode } from "./InterfaceInstanceNode";
import { PrimitiveInstanceNode } from "./PrimitiveInstanceNode";
import { UnionInstanceNode } from "./UnionInstanceNode";

export type InstanceNodeFor<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
> = {
  [TN in TypeName]: Types[TN] extends InterfaceType<keyof Types>
    ? InterfaceInstanceNode<Types, TN, Types[TN]>
    : Types[TN] extends UnionType<keyof Types>
    ? UnionInstanceNode<Types, TN, Types[TN]>
    : Types[TN] extends PrimitiveType
    ? PrimitiveInstanceNode<Types, TypeName, Types[TN]>
    : never;
}[TypeName];

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
