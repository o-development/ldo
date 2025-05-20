import { TransactionDataset } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";
import type { ILdoDataset } from "./types.js";
import { LdoBuilder } from "./LdoBuilder.js";
import type { ShapeType } from "./ShapeType.js";
import type { LdoBase } from "./util.js";
import jsonldDatasetProxy from "@ldo/jsonld-dataset-proxy";

export class LdoTransactionDataset
  extends TransactionDataset<Quad>
  implements ILdoDataset
{
  usingType<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
  ): LdoBuilder<Type> {
    const proxyBuilder = jsonldDatasetProxy(this, shapeType.context);
    return new LdoBuilder(proxyBuilder, shapeType);
  }
}
