import { TransactionDataset } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";
import type { ILdoDataset } from "./types";
import { LdoBuilder } from "./LdoBuilder";
import type { ShapeType } from "./ShapeType";
import type { LdoBase } from "./util";
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
