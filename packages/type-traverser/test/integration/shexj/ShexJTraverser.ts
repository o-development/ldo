import { ShexJTraverserDefinition } from "./ShexJTraverserDefinition";
import { ShexJTraverserTypes } from "./ShexJTraverserTypes";
import { Traverser } from "../../../lib/Traverser";

export const ShexJTraverser = new Traverser<ShexJTraverserTypes>(
  ShexJTraverserDefinition
);
