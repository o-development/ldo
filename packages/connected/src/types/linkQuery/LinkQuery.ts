// This file is a stripped down version of a full-implmentation of a global
// query interface found here https://github.com/o-development/ldo-query/blob/main/lib/ShapeQuery.ts
// If I ever want to implement a global query interface, this is a good place
// to start.

import type { LdoBase, LdSet, ShapeType } from "@ldo/ldo";
import { ProfileShapeType } from "packages/ldo/test/profileData";
import type { SolidProfileShape } from "packages/ldo/test/profileData";

/**
 * Link Query Input
 */
export type LQInputObject<Type> = Partial<{
  [key in keyof Type]: LQInput<Type[key]>;
}>;

export type LQInputSubSet<Type> = Type extends object
  ? LQInputObject<Type>
  : true;

export type LQInput<Type> = Type extends LdSet<infer SetSubType>
  ? LQInputSubSet<SetSubType>
  : LQInputSubSet<Type>;

/**
 * Link Query Input Default
 */
export type LQInputDefaultType<Type> = {
  [key in keyof Type]: Type[key] extends object ? undefined : true;
};

export type LQInputDefault<Type> =
  LQInputDefaultType<Type> extends LQInput<Type>
    ? LQInputDefaultType<Type>
    : never;

/**
 * Link Query Return
 */
export type LQReturnObject<Type, Input extends LQInputObject<Type>> = {
  [key in keyof Required<Type> as undefined extends Input[key]
    ? never
    : key]: Input[key] extends LQInput<Type[key]>
    ? undefined extends Type[key]
      ? LQReturn<Type[key], Input[key]> | undefined
      : LQReturn<Type[key], Input[key]>
    : never;
};

export type LQReturnSubSet<Type, Input> = Input extends LQInputSubSet<Type>
  ? Input extends LQInputObject<Type>
    ? LQReturnObject<Type, Input>
    : Type
  : never;

export type LQReturn<
  Type,
  Input extends LQInput<Type>,
> = NonNullable<Type> extends LdSet<infer SetSubType>
  ? LdSet<LQReturnSubSet<SetSubType, Input>>
  : LQReturnSubSet<Type, Input>;

type ExpandDeep<T> = T extends LdSet<infer U>
  ? LdSet<ExpandDeep<U>> // recursively expand sets
  : T extends object
  ? { [K in keyof T]: ExpandDeep<T[K]> } // recursively expand objects
  : T; // base case (primitive types)

function sampleFunction<Type extends LdoBase, Input extends LQInput<Type>>(
  _shapeType: ShapeType<Type>,
  _input: Input,
): ExpandDeep<LQReturn<Type, Input>> {
  throw new Error("NotImplemented");
}

const value = sampleFunction(ProfileShapeType, {
  hasTelephone: { type: { "@id": true }, value: true },
  name: true,
});

value;
