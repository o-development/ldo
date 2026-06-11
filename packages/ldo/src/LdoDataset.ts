import type { Quad } from "@rdfjs/types";
import { SubscribableDataset } from "@ldo/subscribable-dataset";
import { LdoBuilder } from "./LdoBuilder";
import type { LdoBase } from "./index";
import { LdoTransactionDataset } from "./LdoTransactionDataset";
import type { ILdoDataset } from "./types";
import type { TermWrapper } from "@rdfjs/wrapper";

/**
 * @category Getting an LdoDataset
 *
 * An LdoDataset is a utility for building a linked data object.
 *
 * It is not recommended to instantiate an LdoDataset. Instead use the {@link createLdoDataset} function.
 *
 * @example
 * ```typescript
 * import { LdoDataset, createLdoDatasetFactory } from "@ldo/ldo";
 * import { FoafProfileShapeType } from "./_ldo/foafProfile.shapeTypes";
 *
 * const ldoDatasetFactory = createLdoDatasetFactory();
 * const ldoDataset = new LdoDataset();
 * const ldoBuilder = ldoDataset.usingType(FoafProfileShapeType);
 * ```
 */
export class LdoDataset
  extends SubscribableDataset<Quad>
  implements ILdoDataset
{
  /**
   * Creates an LdoBuilder for a given shapeType
   *
   * @param termWrapperClass - A Term Wrapper Class
   * @returns A builder for the given type
   */
  public usingType<Type extends TermWrapper>(
    termWrapperClass: new () => Type,
  ): LdoBuilder<Type> {
    const proxyBuilder = jsonldDatasetProxy(this, shapeType.context);
    return new LdoBuilder(proxyBuilder, shapeType);
  }

  public startTransaction(): LdoTransactionDataset {
    return new LdoTransactionDataset(
      this,
      this.datasetFactory,
      this.transactionDatasetFactory,
    );
  }
}
