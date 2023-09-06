import { Mixin } from "ts-mixer";
import { FetchedLeaf } from "./FetchedLeaf";
import { Present } from "../fetchStatus/Present";
import type { DataLeaf } from "../../concrete/DataLeaf";
import type { BinaryLeaf } from "../../concrete/BinaryLeaf";

export type PresentLeafClass = DataLeaf | BinaryLeaf;
export abstract class PresentLeaf extends Mixin(FetchedLeaf, Present) {}
