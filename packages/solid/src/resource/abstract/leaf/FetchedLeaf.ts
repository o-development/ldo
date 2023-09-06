import { Mixin } from "ts-mixer";
import { Leaf } from "./Leaf";
import { Fetched } from "../fetchStatus/Fetched";
import type { DataLeaf } from "../../concrete/DataLeaf";
import type { BinaryLeaf } from "../../concrete/BinaryLeaf";
import type { AbsentLeaf } from "../../concrete/AbsentLeaf";

export type FetchedLeafClass = DataLeaf | BinaryLeaf | AbsentLeaf;
export abstract class FetchedLeaf extends Mixin(Leaf, Fetched) {}
