import type { ContextDefinition } from "jsonld";
import type { Schema } from "shexj";
import type { LdoBase } from "./util";

/**
 * A collection of information required by LDO
 */
export type ShapeType<Type extends LdoBase> = {
  schema: Schema;
  shape: string;
  context: ContextDefinition;
  // This field is optional. It's main point is to allow the typescript parser to
  // understand that this shape type is of a specific type.
  exampleData?: Type;
};
