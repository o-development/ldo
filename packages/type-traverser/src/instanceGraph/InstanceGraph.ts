/* eslint-disable @typescript-eslint/no-explicit-any */
import { MultiMap } from "../transformerSubTraversers/util/MultiMap";
import type { TraverserTypes } from "../TraverserTypes";
import type { InstanceNode } from "./nodes/InstanceNode";
import {
  createInstanceNodeFor,
  type InstanceNodeFor,
} from "./nodes/createInstanceNodeFor";
import type { TraverserDefinitions } from "../TraverserDefinition";

export class InstanceGraph<Types extends TraverserTypes<any>> {
  protected objectMap: MultiMap<
    object,
    keyof Types,
    InstanceNode<Types, keyof Types, Types[keyof Types]>
  > = new MultiMap();
  public readonly traverserDefinitions: TraverserDefinitions<Types>;

  constructor(traverserDefinitions: TraverserDefinitions<Types>) {
    this.traverserDefinitions = traverserDefinitions;
  }

  getNodeFor<TypeName extends keyof Types>(
    instance: unknown,
    typeName: TypeName,
  ): InstanceNodeFor<Types, TypeName> {
    let potentialNode;
    // Skip the cache for Primitive Nodes
    if (
      this.traverserDefinitions[typeName].kind !== "primitive" &&
      typeof instance === "object" &&
      instance != null
    ) {
      potentialNode = this.objectMap.get(instance, typeName);
    }
    if (potentialNode) return potentialNode as InstanceNodeFor<Types, TypeName>;
    return createInstanceNodeFor(instance, typeName, this);
  }
}
