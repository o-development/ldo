import { Mixin } from "ts-mixer";
import { FetchedContainer } from "./FetchedContainer";
import { Present } from "../fetchStatus/Present";

export abstract class PresentContainer extends Mixin(
  FetchedContainer,
  Present,
) {}
