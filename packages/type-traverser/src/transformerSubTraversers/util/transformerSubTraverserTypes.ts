/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  BaseReturnType,
  BaseTraverserTypes,
  KeyTypes,
  TransformerReturnTypes,
  TraverserDefinition,
  TraverserTypes,
} from "../..";
import type { Transformers } from "../../Transformers";
import type { CircularDepenedencyAwaiter } from "./CircularDependencyAwaiter";
import type { MultiMap } from "./MultiMap";
import type { SuperPromise } from "./SuperPromise";

export type TransformerSubTraverser<
  Types extends TraverserTypes<any>,
  TypeName extends keyof Types,
  ReturnTypes extends TransformerReturnTypes<Types>,
  Type extends BaseTraverserTypes<keyof Types>,
  ReturnType extends BaseReturnType<Types, TypeName>,
  Context,
> = (
  item: Type["type"],
  itemTypeName: TypeName,
  globals: TransformerSubTraverserGlobals<Types, ReturnTypes, Context>,
) => Promise<ReturnType["return"]>;

export interface TransformerSubTraverserGlobals<
  Types extends TraverserTypes<any>,
  ReturnTypes extends TransformerReturnTypes<Types>,
  Context,
> {
  traverserDefinition: TraverserDefinition<Types>;
  transformers: Transformers<Types, ReturnTypes, Context>;
  executingPromises: TransformerSubTraverserExecutingPromises<keyof Types>;
  circularDependencyAwaiter: CircularDepenedencyAwaiter;
  superPromise: SuperPromise;
  context: Context;
}

export type TransformerSubTraverserExecutingPromises<
  Keys extends KeyTypes = KeyTypes,
> = MultiMap<object, Keys, { promise: Promise<any>; isResolved: boolean }>;
