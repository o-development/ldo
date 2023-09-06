import { Mixin } from "ts-mixer";
import { PresentLeaf } from "../abstract/leaf/PresentLeaf";
import { PotentialBinaryLeaf } from "../abstract/leaf/PotentialBinaryLeaf";

export class BinaryLeaf extends Mixin(PresentLeaf, PotentialBinaryLeaf) {}
