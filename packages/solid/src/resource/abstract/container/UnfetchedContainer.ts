import { Mixin } from "ts-mixer";
import { AbstractContainer } from "./AbstractContainer";
import { Unfetched } from "../fetchStatus/Unfetched";

export class UnfetchedContainer extends Mixin(AbstractContainer, Unfetched) {}
