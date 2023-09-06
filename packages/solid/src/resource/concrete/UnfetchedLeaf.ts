import { Mixin } from "ts-mixer";
import { Unfetched } from "../abstract/fetchStatus/Unfetched";
import { PotentialBinaryLeaf } from "../abstract/leaf/PotentialBinaryLeaf";
import { PotentialDataLeaf } from "../abstract/leaf/PotentialDataLeaf";

export class UnfetchedLeaf extends Mixin(
  Unfetched,
  PotentialBinaryLeaf,
  PotentialDataLeaf,
) {}
