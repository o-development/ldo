/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  InterfaceType,
  TraverserTypes,
  UnionType,
  PrimitiveType,
} from ".";

export type InterfaceTraverserDefinition<Type extends InterfaceType<any>> = {
  kind: "interface";
  properties: {
    [PropertyField in keyof Type["properties"]]: Type["properties"][PropertyField];
  };
};

export type UnionTraverserDefinition<Type extends UnionType<any>> = {
  kind: "union";
  selector: (item: Type["type"]) => Type["typeNames"];
};

export type PrimitiveTraverserDefinition = {
  kind: "primitive";
};

export type TraverserDefinition<
  Types extends TraverserTypes<any>,
  TypeField extends keyof Types,
> = Types[TypeField] extends InterfaceType<keyof Types>
  ? InterfaceTraverserDefinition<Types[TypeField]>
  : Types[TypeField] extends UnionType<keyof Types>
  ? UnionTraverserDefinition<Types[TypeField]>
  : Types[TypeField] extends PrimitiveType
  ? PrimitiveTraverserDefinition
  : never;

export type TraverserDefinitions<Types extends TraverserTypes<any>> = {
  [TypeField in keyof Types]: TraverserDefinition<Types, TypeField>;
};
