import { Mixin } from "ts-mixer";
import { PresentContainer } from "./PresentContainer";
import { Absent } from "../fetchStatus/Absent";

export class AbsentContainer extends Mixin(PresentContainer, Absent) {}
