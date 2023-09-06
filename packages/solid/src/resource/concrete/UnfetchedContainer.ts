import { Mixin } from "ts-mixer";
import { Container } from "../abstract/container/Container";
import { Unfetched } from "../abstract/fetchStatus/Unfetched";

export class UnfetchedContainer extends Mixin(Container, Unfetched) {}
