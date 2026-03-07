import { ReadSuccess } from "@ldo/connected";
import type { NextGraphResource } from "../resources/NextGraphResource";

export class NextGraphReadSuccess extends ReadSuccess<NextGraphResource> {
  type = "nextGraphReadSuccess" as const;
}
