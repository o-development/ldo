// This file is a stripped down version of a full-implmentation of a global
// query interface found here https://github.com/o-development/ldo-query/blob/main/lib/ShapeQuery.ts
// If I ever want to implement a global query interface, this is a good place
// to start.

import type { LdoBase, LdSet, ShapeType } from "@ldo/ldo";
import { ProfileShapeType } from "packages/ldo/test/profileData";
import { SolidProfileShape } from "packages/ldo/test/profileData";
import { PostShShapeType } from "packages/solid-react/test/.ldo/post.shapeTypes";

/**
 * Link Query Input
 */
export type LQInputObject<Type> = Partial<{
  [key in keyof Type]: LQInput<Type[key]>;
}>;

export type LQInputSubArray<Type> = Type extends object
  ? LQInputObject<Type>
  : true;

export type LQInput<Type> = Type extends LdSet<infer ArraySubType>
  ? LQInputSubArray<ArraySubType>
  : LQInputSubArray<Type>;

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
      ? LQReturnRecursive<Type[key], Input[key]> | undefined
      : LQReturnRecursive<Type[key], Input[key]>
    : never;
};

export type LQReturnSubArray<Type, Input> = Input extends LQInputSubArray<Input>
  ? Type extends object
    ? LQReturnObject<Type, Input>
    : Type
  : never;

export type LQReturnRecursive<
  Type,
  Input extends LQInput<Type>,
> = NonNullable<Type> extends LdSet<infer ArraySubType>
  ? LdSet<LQReturnSubArray<ArraySubType, Input>>
  : LQReturnSubArray<Type, Input>;

export type LQReturn<Type, Input extends LQInput<Type>> = LQReturnRecursive<
  Type,
  Input
>;

type ExpandDeep<T> = T extends LdSet<infer U>
  ? LdSet<ExpandDeep<U>> // recursively expand arrays
  : T extends object
  ? { [K in keyof T]: ExpandDeep<T[K]> } // recursively expand objects
  : T; // base case (primitive types)

function sampleFunction<Type extends LdoBase, Input extends LQInput<Type>>(
  _shapeType: ShapeType<Type>,
  _input: Input,
): ExpandDeep<LQReturn<Type, Input>> {
  throw new Error("NotImplemented");
}

type other = ExpandDeep<LQInput<SolidProfileShape>>;

const value = sampleFunction(ProfileShapeType, {
  hasTelephone: { type: { "@id": true }, value: true },
});

value;
