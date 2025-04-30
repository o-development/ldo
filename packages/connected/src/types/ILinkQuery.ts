// This file is a stripped down version of a full-implmentation of a global
// query interface found here https://github.com/o-development/ldo-query/blob/main/lib/ShapeQuery.ts
// If I ever want to implement a global query interface, this is a good place
// to start.

import type { LdoBase, LdSet, ShapeType } from "@ldo/ldo";
import { ProfileShapeType } from "packages/ldo/test/profileData";

/**
 * Link Query Input
 */
export type LQInput<Type> = LQInputObject<Type>;

export type LQInputObject<Type> = Partial<{
  [key in keyof Type]: LQInputFlattenSet<Type[key]>;
}>;

export type LQInputSubSet<Type> = Type extends object
  ? LQInputObject<Type>
  : true;

export type LQInputFlattenSet<Type> = Type extends LdSet<infer SetSubType>
  ? LQInputSubSet<SetSubType>
  : LQInputSubSet<Type>;

/**
 * Link Query Input Default
 */
// TODO: I don't remember why I need this. Delete if unneeded
// export type LQInputDefaultType<Type> = {
//   [key in keyof Type]: Type[key] extends object ? undefined : true;
// };

// export type LQInputDefault<Type> =
//   LQInputDefaultType<Type> extends LQInput<Type>
//     ? LQInputDefaultType<Type>
//     : never;

/**
 * Link Query Return
 */
export type LQReturn<Type, Input extends LQInput<Type>> = LQReturnObject<
  Type,
  Input
>;

export type LQReturnObject<Type, Input extends LQInputObject<Type>> = {
  [key in keyof Required<Type> as undefined extends Input[key]
    ? never
    : key]: Input[key] extends LQInputFlattenSet<Type[key]>
    ? undefined extends Type[key]
      ? LQReturnExpandSet<Type[key], Input[key]> | undefined
      : LQReturnExpandSet<Type[key], Input[key]>
    : never;
};

export type LQReturnSubSet<Type, Input> = Input extends LQInputSubSet<Type>
  ? Input extends LQInputObject<Type>
    ? LQReturnObject<Type, Input>
    : Type
  : never;

export type LQReturnExpandSet<
  Type,
  Input extends LQInputFlattenSet<Type>,
> = NonNullable<Type> extends LdSet<infer SetSubType>
  ? LdSet<LQReturnSubSet<SetSubType, Input>>
  : LQReturnSubSet<Type, Input>;

export type ExpandDeep<T> = T extends LdSet<infer U>
  ? LdSet<ExpandDeep<U>> // recursively expand sets
  : T extends object
  ? { [K in keyof T]: ExpandDeep<T[K]> } // recursively expand objects
  : T; // base case (primitive types)

/**
 * ILinkQuery: Manages resources in a link query
 */
export interface LinkQueryRunOptions {
  reload?: boolean;
}

export interface ILinkQuery<Type extends LdoBase, Input extends LQInput<Type>> {
  run(
    options?: LinkQueryRunOptions,
  ): Promise<ExpandDeep<LQReturn<Type, Input>>>;
  subscribe(): Promise<string>;
  unsubscribe(subscriptionId: string): void;
  fromSubject(): ExpandDeep<LQReturn<Type, Input>>;
}

// TODO: Remove test functions
// function test<Type extends LdoBase, Input extends LQInput<Type>>(
//   _shapeType: ShapeType<Type>,
//   _input: Input,
// ): ExpandDeep<LQReturn<Type, Input>> {
//   throw new Error("Not Implemeneted");
// }
// const result = test(ProfileShapeType, {
//   fn: true,
//   name: true,
//   hasTelephone: {
//     type: {
//       "@id": true,
//     },
//     value: true,
//   },
// });
