import type { AbsentLeaf } from "../../concrete/AbsentLeaf";
import type { BinaryLeaf } from "../../concrete/BinaryLeaf";
import type { DataLeaf } from "../../concrete/DataLeaf";
import type { UnfetchedLeaf } from "../../concrete/UnfetchedLeaf";

export type LeafClass = DataLeaf | BinaryLeaf | AbsentLeaf | UnfetchedLeaf;
export class Leaf {}
