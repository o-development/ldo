import { Mixin } from "ts-mixer";
import { Absent } from "../abstract/fetchStatus/Absent";
import { Container } from "../abstract/container/Container";

export class AbsentContainer extends Mixin(Absent, Container) {}
