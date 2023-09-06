import { Mixin } from "ts-mixer";
import { PresentLeaf } from "../abstract/leaf/PresentLeaf";
import { PotentialDataLeaf } from "../abstract/leaf/PotentialDataLeaf";

export class DataLeaf extends Mixin(PresentLeaf, PotentialDataLeaf) {}
