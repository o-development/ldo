import { Mixin } from "ts-mixer";
import { Absent } from "../abstract/fetchStatus/Absent";
import { PotentialBinaryLeaf } from "../abstract/leaf/PotentialBinaryLeaf";

export class AbsentLeaf extends Mixin(Absent, PotentialBinaryLeaf) {}
