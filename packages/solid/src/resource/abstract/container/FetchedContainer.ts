import { Mixin } from "ts-mixer";
import { AbstractContainer } from "./AbstractContainer";
import { Fetched } from "../fetchStatus/Fetched";

export abstract class FetchedContainer extends Mixin(
  AbstractContainer,
  Fetched,
) {}
