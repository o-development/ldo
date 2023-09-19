import type { Container } from "../../resource/Container";
import type { Leaf } from "../../resource/Leaf";

export interface RequesterResult {
  type: string;
  isError: boolean;
  resource?: Leaf | Container;
}
