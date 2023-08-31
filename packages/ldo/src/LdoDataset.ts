import type { Quad } from "@rdfjs/types";
import jsonldDatasetProxy from "jsonld-dataset-proxy";
import { WrapperSubscribableDataset } from "o-dataset-pack";
import { LdoBuilder } from "./LdoBuilder";
import type { ShapeType } from "./ShapeType";
import type { LdoBase } from "./util";

/**
 * Utility for building a linked data object
 */
export class LdoDataset extends WrapperSubscribableDataset<Quad> {
  /**
   * Gets a builder for a given type
   * @param shapeType A ShapeType
   * @returns A builder for the given type
   */
  public usingType<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
  ): LdoBuilder<Type> {
    const proxyBuilder = jsonldDatasetProxy(this, shapeType.context);
    return new LdoBuilder(proxyBuilder, shapeType);
  }
}
