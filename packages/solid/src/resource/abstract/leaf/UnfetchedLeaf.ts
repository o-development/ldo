import { Mixin } from "ts-mixer";
import { AbstractLeaf } from "./AbstractLeaf";
import { Unfetched } from "../fetchStatus/Unfetched";

export class UnfetchedLeaf extends Mixin(AbstractLeaf, Unfetched) {}
