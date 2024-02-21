import type { ISubscribableDataset } from "@ldo/subscribable-dataset";
import type { LdoBuilder } from "./LdoBuilder";
import type { ShapeType } from "./ShapeType";
import type { LdoBase } from "./util";
import type { Quad } from "@rdfjs/types";

export interface ILdoDataset extends ISubscribableDataset<Quad> {
  usingType<Type extends LdoBase>(shapeType: ShapeType<Type>): LdoBuilder<Type>;
}
