import { Mixin } from "ts-mixer";
import { FetchedLeaf } from "./FetchedLeaf";
import { Present } from "../fetchStatus/Present";

export abstract class PresentLeaf extends Mixin(FetchedLeaf, Present) {}
