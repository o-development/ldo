/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TraverserTypes, UnionType } from "../../TraverserTypes";
import type { InstanceNodeFor } from "./createInstanceNodeFor";
import { InstanceNode } from "./InstanceNode";

export class UnionInstanceNode<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  Type extends UnionType<keyof Types> & Types[TypeName],
> extends InstanceNode<Types, TypeName, Type> {
  private childNode: InstanceNodeFor<Types, Type["typeNames"]> | undefined;

  public _setChild(child: InstanceNodeFor<Types, Type["typeNames"]>): void {
    this.childNode = child;
  }

  public child(): InstanceNodeFor<Types, Type["typeNames"]> | undefined {
    return this.childNode;
  }

  public allChildren(): InstanceNodeFor<Types, Type["typeNames"]>[] {
    return this.childNode ? [this.childNode] : [];
  }
  protected _recursivelyBuildChildren() {
    // TODO
  }
}
