import { LdoDataset } from "@ldo/ldo";
import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import type { Container } from "./resource/Container";
import type { Leaf } from "./resource/Leaf";
import type { ResourceGetterOptions } from "./ResourceStore";
import type { SolidLdoDatasetContext } from "./SolidLdoDatasetContext";
import type { ContainerUri, LeafUri } from "./util/uriTypes";
import { SolidLdoTransactionDataset } from "./SolidLdoTransactionDataset";
import type { ITransactionDatasetFactory } from "@ldo/subscribable-dataset";

/**
 * A SolidLdoDataset has all the functionality of an LdoDataset with the added
 * functionality of keeping track of fetched Solid Resources.
 *
 * It is recommended to use the { @link createSolidLdoDataset } to initialize
 * this class
 *
 * @example
 * ```typescript
 * import { createSolidLdoDataset } from "@ldo/solid";
 * import { ProfileShapeType } from "./.ldo/profile.shapeTypes.ts"
 *
 * // ...
 *
 * const solidLdoDataset = createSolidLdoDataset();
 *
 * const profileDocument = solidLdoDataset
 *   .getResource("https://example.com/profile");
 * await profileDocument.read();
 *
 * const profile = solidLdoDataset
 *   .using(ProfileShapeType)
 *   .fromSubject("https://example.com/profile#me");
 * ```
 */
export class SolidLdoDataset extends LdoDataset {
  /**
   * @internal
   */
  public context: SolidLdoDatasetContext;

  /**
   * @param context - SolidLdoDatasetContext
   * @param datasetFactory - An optional dataset factory
   * @param transactionDatasetFactory - A factory for creating transaction datasets
   * @param initialDataset - A set of triples to initialize this dataset
   */
  constructor(
    context: SolidLdoDatasetContext,
    datasetFactory: DatasetFactory,
    transactionDatasetFactory: ITransactionDatasetFactory<Quad>,
    initialDataset?: Dataset,
  ) {
    super(datasetFactory, transactionDatasetFactory, initialDataset);
    this.context = context;
  }

  /**
   * Retireves a representation (either a LeafResource or a ContainerResource)
   * of a Solid Resource at the given URI. This resource represents the
   * current state of the resource: whether it is currently fetched or in the
   * process of fetching as well as some information about it.
   *
   * @param uri - the URI of the resource
   * @param options - Special options for getting the resource
   *
   * @returns a Leaf or Container Resource
   *
   * @example
   * ```typescript
   * const profileDocument = solidLdoDataset
   *   .getResource("https://example.com/profile");
   * ```
   */
  getResource(uri: ContainerUri, options?: ResourceGetterOptions): Container;
  getResource(uri: LeafUri, options?: ResourceGetterOptions): Leaf;
  getResource(uri: string, options?: ResourceGetterOptions): Leaf | Container;
  getResource(uri: string, options?: ResourceGetterOptions): Leaf | Container {
    return this.context.resourceStore.get(uri, options);
  }

  public startTransaction(): SolidLdoTransactionDataset {
    return new SolidLdoTransactionDataset(
      this,
      this.context,
      this.datasetFactory,
      this.transactionDatasetFactory,
    );
  }
}
