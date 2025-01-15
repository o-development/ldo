import type { LdoBase, ShapeType } from "@ldo/ldo";
import { LdoDataset, startTransaction } from "@ldo/ldo";
import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import type { Container } from "./resource/Container";
import type { Leaf } from "./resource/Leaf";
import type { ResourceGetterOptions } from "./ResourceStore";
import type { SolidLdoDatasetContext } from "./SolidLdoDatasetContext";
import type { ContainerUri, LeafUri } from "./util/uriTypes";
import { SolidLdoTransactionDataset } from "./SolidLdoTransactionDataset";
import type { ITransactionDatasetFactory } from "@ldo/subscribable-dataset";
import type { SubjectNode } from "@ldo/rdf-utils";
import type { Resource } from "./resource/Resource";
import type { CheckRootResultError } from "./requester/requests/checkRootContainer";
import type { NoRootContainerError } from "./requester/results/error/NoRootContainerError";
import type { ReadResultError } from "./requester/requests/readResource";
import { ProfileWithStorageShapeType } from "./.ldo/solid.shapeTypes";
import type { GetStorageContainerFromWebIdSuccess } from "./requester/results/success/CheckRootContainerSuccess";
import type { ISolidLdoDataset } from "./types";

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
export class SolidLdoDataset extends LdoDataset implements ISolidLdoDataset {
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

  /**
   * Shorthand for solidLdoDataset
   *   .usingType(shapeType)
   *   .write(...resources.map((r) => r.uri))
   *   .fromSubject(subject);
   * @param shapeType - The shapetype to represent the data
   * @param subject - A subject URI
   * @param resources - The resources changes to should written to
   */
  createData<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: string | SubjectNode,
    resource: Resource,
    ...additionalResources: Resource[]
  ): Type {
    const resources = [resource, ...additionalResources];
    const linkedDataObject = this.usingType(shapeType)
      .write(...resources.map((r) => r.uri))
      .fromSubject(subject);
    startTransaction(linkedDataObject);
    return linkedDataObject;
  }

  /**
   * Gets a list of root storage containers for a user given their WebId
   * @param webId: The webId for the user
   * @returns A list of storages if successful, an error if not
   * @example
   * ```typescript
   * const result = await solidLdoDataset
   *   .getStorageFromWebId("https://example.com/profile/card#me");
   * if (result.isError) {
   *   // Do something
   * }
   * console.log(result.storageContainer[0].uri);
   * ```
   */
  async getStorageFromWebId(
    webId: LeafUri,
  ): Promise<
    | GetStorageContainerFromWebIdSuccess
    | CheckRootResultError
    | ReadResultError
    | NoRootContainerError
  > {
    const webIdResource = this.getResource(webId);
    const readResult = await webIdResource.readIfUnfetched();
    if (readResult.isError) return readResult;
    const profile = this.usingType(ProfileWithStorageShapeType).fromSubject(
      webId,
    );
    if (profile.storage && profile.storage.length > 0) {
      const containers = profile.storage.map((storageNode) =>
        this.getResource(storageNode["@id"] as ContainerUri),
      );
      return {
        type: "getStorageContainerFromWebIdSuccess",
        isError: false,
        storageContainers: containers,
      };
    }
    const getContainerResult = await webIdResource.getRootContainer();
    if (getContainerResult.type === "container")
      return {
        type: "getStorageContainerFromWebIdSuccess",
        isError: false,
        storageContainers: [getContainerResult],
      };
    return getContainerResult;
  }
}
