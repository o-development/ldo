import { Mixin } from "ts-mixer";
import { AbstractLeaf } from "./AbstractLeaf";
import { Fetched } from "../fetchStatus/Fetched";

export abstract class FetchedLeaf extends Mixin(AbstractLeaf, Fetched) {}
