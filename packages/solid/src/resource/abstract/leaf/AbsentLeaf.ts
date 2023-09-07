import { Mixin } from "ts-mixer";
import { Absent } from "../fetchStatus/Absent";
import { FetchedLeaf } from "./FetchedLeaf";

export class AbsentLeaf extends Mixin(FetchedLeaf, Absent) {}
