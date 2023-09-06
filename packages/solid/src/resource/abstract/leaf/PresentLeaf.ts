import { Mixin } from "ts-mixer";
import { Leaf } from "./Leaf";
import { Present } from "../fetchStatus/Present";
import type { DataLeaf } from "../../concrete/DataLeaf";
import type { BinaryLeaf } from "../../concrete/BinaryLeaf";

export type PresentLeafClass = DataLeaf | BinaryLeaf;
export class PresentLeaf extends Mixin(Leaf, Present) {}
