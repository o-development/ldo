/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TraverserDefinition } from "../..";
import type { ParentIdentifiers } from "../../reverseRelationshipTypes";
import type { TraverserTypes } from "../../TraverserTypes";
import type { InstanceGraph } from "../instanceGraph";
import type { InstanceNodeFor } from "./createInstanceNodeFor";

export abstract class InstanceNode<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  _Type extends Types[TypeName],
> {
  readonly graph: InstanceGraph<Types>;
  readonly instance: Types[TypeName]["type"];
  readonly typeName: TypeName;
  protected readonly parents: Record<
    string,
    Set<InstanceNodeFor<Types, Types[ParentIdentifiers<Types, TypeName>[0]]>>
  >;

  constructor(
    graph: InstanceGraph<Types>,
    instance: Types[TypeName]["type"],
    typeName: TypeName,
  ) {
    this.graph = graph;
    this.instance = instance;
    this.typeName = typeName;
    this._recursivelyBuildChildren();
  }

  private getParentKey(
    identifiers: ParentIdentifiers<Types, TypeName>,
  ): string {
    return identifiers.join("|");
  }

  public _setParent<Identifiers extends ParentIdentifiers<Types, TypeName>>(
    identifiers: Identifiers,
    parentNode: InstanceNodeFor<Types, Types[Identifiers[0]]>,
  ) {
    const parentKey = this.getParentKey(identifiers);
    if (!this.parents[parentKey]) this.parents[parentKey] = new Set();
    this.parents[parentKey].add(parentNode);
  }

  public parent<Identifiers extends ParentIdentifiers<Types, TypeName>>(
    ...identifiers: Identifiers
  ): InstanceNodeFor<Types, Identifiers[0]>[] {
    return Array.from(this.parents[this.getParentKey(identifiers)] ?? []);
  }

  public allParents(): InstanceNodeFor<
    Types,
    ParentIdentifiers<Types, TypeName>[0]
  >[] {
    return Object.values(this.parents)
      .map((parentSet) => Array.from(parentSet))
      .flat();
  }

  public abstract _setChild(...props: any[]): void;

  public abstract child(...props: any[]): any;

  /**
   * Returns all nodes that are children of this node reguardless of their edge
   */
  public abstract allChildren(): InstanceNode<
    Types,
    keyof Types,
    Types[keyof Types]
  >[];

  protected abstract _recursivelyBuildChildren(): void;

  public get traverserDefinition(): TraverserDefinition<Types, TypeName> {
    return this.graph.traverserDefinitions[this.typeName];
  }
}
