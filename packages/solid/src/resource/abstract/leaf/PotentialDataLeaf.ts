import { Mixin } from "ts-mixer";
import type { AbsentLeaf } from "../../concrete/AbsentLeaf";
import type { DataLeaf } from "../../concrete/DataLeaf";
import type { UnfetchedLeaf } from "../../concrete/UnfetchedLeaf";
import { PotentialDataResource } from "../dataResource/potentialDataResource";
import { Leaf } from "./Leaf";

export type PotentialDataLeafClass = DataLeaf | AbsentLeaf | UnfetchedLeaf;
export class PotentialDataLeaf extends Mixin(Leaf, PotentialDataResource) {}
