/* eslint-disable @typescript-eslint/no-explicit-any */
$1$2.js$3
import { InstanceNode } from "./InstanceNode.js";

export class PrimitiveInstanceNode<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  Type extends PrimitiveType & Types[TypeName],
> extends InstanceNode<Types, TypeName, Type> {
  public _setChild(): void {
    return;
  }
  public child() {
    return undefined;
  }
  public allChildren(): [] {
    return [];
  }
  public _recursivelyBuildChildren(): void {
    return;
  }
}
