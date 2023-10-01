import { ShexJTraverserDefinition } from "./ShexJTraverserDefinition";
import type { ShexJTraverserTypes } from "./ShexJTraverserTypes";
import { Traverser } from "@ldo/type-traverser";

export const ShexJTraverser = new Traverser<ShexJTraverserTypes>(
  ShexJTraverserDefinition,
);
