/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  InterfaceType,
  PrimitiveType,
  TraverserTypes,
  UnionType,
} from ".";

export type InterfaceVisitorFunction<
  Types extends TraverserTypes<any>,
  Type extends InterfaceType<keyof Types>,
  Context,
> = (originalData: Type["type"], context: Context) => Promise<void>;

export type InterfaceVisitorPropertyFunction<
  Types extends TraverserTypes<any>,
  Type extends InterfaceType<keyof Types>,
  PropertyName extends keyof Type["properties"],
  Context,
> = (
  originalData: Types[Type["properties"][PropertyName]]["type"],
  context: Context,
) => Promise<void>;

export type InterfaceVisitorDefinition<
  Types extends TraverserTypes<any>,
  Type extends InterfaceType<keyof Types>,
  Context,
> = {
  visitor: InterfaceVisitorFunction<Types, Type, Context>;
  properties: {
    [PropertyName in keyof Type["properties"]]: InterfaceVisitorPropertyFunction<
      Types,
      Type,
      PropertyName,
      Context
    >;
  };
};

export type UnionVisitorFunction<
  Types extends TraverserTypes<any>,
  Type extends UnionType<keyof Types>,
  Context,
> = (originalData: Type["type"], context: Context) => Promise<void>;

export type UnionVisitorDefinition<
  Types extends TraverserTypes<any>,
  Type extends UnionType<keyof Types>,
  Context,
> = UnionVisitorFunction<Types, Type, Context>;

export type PrimitiveVisitorFunction<Type extends PrimitiveType, Context> = (
  originalData: Type["type"],
  context: Context,
) => Promise<void>;

export type PrimitiveVisitorDefinition<
  Type extends PrimitiveType,
  Context,
> = PrimitiveVisitorFunction<Type, Context>;

export type VisitorDefinition<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  Context,
> = Types[TypeName] extends InterfaceType<keyof Types>
  ? InterfaceVisitorDefinition<Types, Types[TypeName], Context>
  : Types[TypeName] extends UnionType<keyof Types>
  ? UnionVisitorDefinition<Types, Types[TypeName], Context>
  : Types[TypeName] extends PrimitiveType
  ? PrimitiveVisitorDefinition<Types[TypeName], Context>
  : never;

export type Visitors<Types extends TraverserTypes<any>, Context> = {
  [TypeName in keyof Types]: VisitorDefinition<Types, TypeName, Context>;
};

/**
 * Input
 */
export type InterfaceVisitorInputDefinition<
  Types extends TraverserTypes<any>,
  Type extends InterfaceType<keyof Types>,
  Context,
> = {
  visitor: InterfaceVisitorFunction<Types, Type, Context>;
  properties?: Partial<{
    [PropertyName in keyof Type["properties"]]: InterfaceVisitorPropertyFunction<
      Types,
      Type,
      PropertyName,
      Context
    >;
  }>;
};

export type UnionVisitorInputDefinition<
  Types extends TraverserTypes<any>,
  Type extends UnionType<keyof Types>,
  Context,
> = UnionVisitorFunction<Types, Type, Context>;

export type PrimitiveVisitorInputDefinition<
  Type extends PrimitiveType,
  Context,
> = PrimitiveVisitorFunction<Type, Context>;

export type VisitorInputDefinition<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  Context,
> = Types[TypeName] extends InterfaceType<keyof Types>
  ? InterfaceVisitorInputDefinition<Types, Types[TypeName], Context>
  : Types[TypeName] extends UnionType<keyof Types>
  ? UnionVisitorInputDefinition<Types, Types[TypeName], Context>
  : Types[TypeName] extends PrimitiveType
  ? PrimitiveVisitorInputDefinition<Types[TypeName], Context>
  : never;

export type VisitorsInput<
  Types extends TraverserTypes<any>,
  Context,
> = Partial<{
  [TypeName in keyof Types]: VisitorInputDefinition<Types, TypeName, Context>;
}>;
