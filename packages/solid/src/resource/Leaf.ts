import type { DatasetChanges } from "@ldo/rdf-utils";
import type { Quad } from "@rdfjs/types";
import { LeafBatchedRequester } from "../requester/LeafBatchedRequester";
import type { CheckRootResultError } from "../requester/requests/checkRootContainer";
import type {
  LeafCreateAndOverwriteResult,
  LeafCreateIfAbsentResult,
} from "../requester/requests/createDataResource";
import type { DeleteResult } from "../requester/requests/deleteResource";
import type { ReadLeafResult } from "../requester/requests/readResource";
import type { UpdateResult } from "../requester/requests/updateDataResource";
import type { DeleteSuccess } from "../requester/results/success/DeleteSuccess";
import type { AbsentReadSuccess } from "../requester/results/success/ReadSuccess";
import type {
  BinaryReadSuccess,
  DataReadSuccess,
} from "../requester/results/success/ReadSuccess";
import type { ResourceSuccess } from "../requester/results/success/SuccessResult";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import { getParentUri } from "../util/rdfUtils";
import type { LeafUri } from "../util/uriTypes";
import type { Container } from "./Container";
import type { SharedStatuses } from "./Resource";
import { Resource } from "./Resource";
import type { ResourceResult } from "./resourceResult/ResourceResult";

/**
 * Represents the current status of a specific Leaf on a Pod as known by LDO.
 *
 * @example
 * ```typescript
 * const leaf = solidLdoDataset
 *   .getResource("https://example.com/container/resource.ttl");
 * ```
 */
export class Leaf extends Resource {
  /**
   * The URI of the leaf
   */
  readonly uri: LeafUri;

  /**
   * @internal
   * Batched Requester for the Leaf
   */
  protected requester: LeafBatchedRequester;

  /**
   * Indicates that this resource is a leaf resource
   */
  readonly type = "leaf" as const;

  /**
   * Indicates that this resource is not an error
   */
  readonly isError = false as const;

  /**
   * The status of the last request made for this leaf
   */
  status:
    | SharedStatuses
    | ReadLeafResult
    | LeafCreateAndOverwriteResult
    | LeafCreateIfAbsentResult
    | UpdateResult;

  /**
   * @internal
   * The raw binary data if this leaf is a Binary resource
   */
  protected binaryData: { blob: Blob; mimeType: string } | undefined;

  /**
   * @param uri - The uri of the leaf
   * @param context - SolidLdoDatasetContext for the parent dataset
   */
  constructor(uri: LeafUri, context: SolidLdoDatasetContext) {
    super(context);
    this.uri = uri;
    this.requester = new LeafBatchedRequester(uri, context);
    this.status = { isError: false, type: "unfetched", uri };
  }

  /**
   * ===========================================================================
   * GETTERS
   * ===========================================================================
   */

  /**
   * Checks to see if the resource is currently uploading data
   * @returns true if the current resource is uploading
   *
   * @example
   * ```typescript
   * leaf.uploadAndOverwrite(new Blob("some text"), "text/txt").then(() => {
   *   // Logs "false"
   *   console.log(leaf.isUploading())
   * });
   * // Logs "true"
   * console.log(leaf.isUploading());
   * ```
   */
  isUploading(): boolean {
    return this.requester.isUploading();
  }

  /**
   * Checks to see if the resource is currently updating data
   * @returns true if the current resource is updating
   *
   * @example
   * ```typescript
   * leaf.update(datasetChanges).then(() => {
   *   // Logs "false"
   *   console.log(leaf.isUpdating())
   * });
   * // Logs "true"
   * console.log(leaf.isUpdating());
   * ```
   */
  isUpdating(): boolean {
    return this.requester.isUpdating();
  }

  /**
   * If this resource is a binary resource, returns the mime type
   * @returns The mime type if this resource is a binary resource, undefined
   * otherwise
   *
   * @example
   * ```typescript
   * // Logs "text/txt"
   * console.log(leaf.getMimeType());
   * ```
   */
  getMimeType(): string | undefined {
    return this.binaryData?.mimeType;
  }

  /**
   * If this resource is a binary resource, returns the Blob
   * @returns The Blob  if this resource is a binary resource, undefined
   * otherwise
   *
   * @example
   * ```typescript
   * // Logs "some text."
   * console.log(leaf.getBlob()?.toString());
   * ```
   */
  getBlob(): Blob | undefined {
    return this.binaryData?.blob;
  }

  /**
   * Check if this resource is a binary resource
   * @returns True if this resource is a binary resource, false if not,
   * undefined if unknown
   *
   * @example
   * ```typescript
   * // Logs "undefined"
   * console.log(leaf.isBinary());
   * const result = await leaf.read();
   * if (!result.isError) {
   *   // Logs "true"
   *   console.log(leaf.isBinary());
   * }
   * ```
   */
  isBinary(): boolean | undefined {
    if (!this.didInitialFetch) {
      return undefined;
    }
    return !!this.binaryData;
  }

  /**
   * Check if this resource is a data (RDF) resource
   * @returns True if this resource is a data resource, false if not, undefined
   * if unknown
   *
   * @example
   * ```typescript
   * // Logs "undefined"
   * console.log(leaf.isDataResource());
   * const result = await leaf.read();
   * if (!result.isError) {
   *   // Logs "true"
   *   console.log(leaf.isDataResource());
   * }
   * ```
   */
  isDataResource(): boolean | undefined {
    if (!this.didInitialFetch) {
      return undefined;
    }
    return !this.binaryData;
  }

  /**
   * ===========================================================================
   * READ METHODS
   * ===========================================================================
   */

  /**
   * @internal
   * A helper method updates this leaf's internal state upon read success
   * @param result - the result of the read success
   */
  protected updateWithReadSuccess(
    result: BinaryReadSuccess | DataReadSuccess | AbsentReadSuccess,
  ): void {
    super.updateWithReadSuccess(result);
    if (result.type === "binaryReadSuccess") {
      this.binaryData = { blob: result.blob, mimeType: result.mimeType };
    } else {
      this.binaryData = undefined;
    }
  }

  /**
   * Reads the leaf by making a request
   * @returns A read result
   *
   * @example
   * ```typescript
   * const result = await leaf.read();
   * if (result.isError) {
   *   // Do something
   * }
   * ```
   */
  async read(): Promise<ResourceResult<ReadLeafResult, Leaf>> {
    const result = (await this.handleRead()) as ReadLeafResult;
    if (result.isError) return result;
    return { ...result, resource: this };
  }

  /**
   * @internal
   * Converts the current state of this leaf to a readResult
   * @returns a ReadLeafResult
   */
  protected toReadResult(): ResourceResult<ReadLeafResult, Leaf> {
    if (this.isAbsent()) {
      return {
        isError: false,
        type: "absentReadSuccess",
        uri: this.uri,
        recalledFromMemory: true,
        resource: this,
      };
    } else if (this.isBinary()) {
      return {
        isError: false,
        type: "binaryReadSuccess",
        uri: this.uri,
        recalledFromMemory: true,
        blob: this.binaryData!.blob,
        mimeType: this.binaryData!.mimeType,
        resource: this,
      };
    } else {
      return {
        isError: false,
        type: "dataReadSuccess",
        uri: this.uri,
        recalledFromMemory: true,
        resource: this,
      };
    }
  }

  /**
   * Makes a request to read this leaf if it hasn't been fetched yet. If it has,
   * return the cached informtation
   * @returns a ReadLeafResult
   *
   * @example
   * ```typescript
   * const result = await leaf.read();
   * if (!result.isError) {
   *   // Will execute without making a request
   *   const result2 = await leaf.readIfUnfetched();
   * }
   * ```
   */
  async readIfUnfetched(): Promise<ResourceResult<ReadLeafResult, Leaf>> {
    return super.readIfUnfetched() as Promise<
      ResourceResult<ReadLeafResult, Leaf>
    >;
  }

  /**
   * ===========================================================================
   * PARENT CONTAINER METHODS
   * ===========================================================================
   */

  /**
   * Gets the parent container for this leaf by making a request
   * @returns The parent container
   *
   * @example
   * ```typescript
   * const leaf = solidLdoDataset
   *   .getResource("https://example.com/container/resource.ttl");
   * const leafParent = leaf.getParentContainer();
   * if (!leafParent.isError) {
   *   // Logs "https://example.com/container/"
   *   console.log(leafParent.uri);
   * }
   * ```
   */
  getParentContainer(): Container {
    const parentUri = getParentUri(this.uri)!;
    return this.context.resourceStore.get(parentUri);
  }

  /**
   * Gets the root container for this leaf.
   * @returns The root container for this leaf
   *
   * @example
   * Suppose the root container is at `https://example.com/`
   *
   * ```typescript
   * const leaf = ldoSolidDataset
   *   .getResource("https://example.com/container/resource.ttl");
   * const rootContainer = await leaf.getRootContainer();
   * if (!rootContainer.isError) {
   *   // logs "https://example.com/"
   *   console.log(rootContainer.uri);
   * }
   * ```
   */
  getRootContainer(): Promise<Container | CheckRootResultError> {
    const parent = this.getParentContainer();
    return parent.getRootContainer();
  }

  /**
   * ===========================================================================
   * DELETE METHODS
   * ===========================================================================
   */

  /**
   * @internal
   * A helper method updates this leaf's internal state upon delete success
   * @param result - the result of the delete success
   */
  protected updateWithDeleteSuccess(_result: DeleteSuccess) {
    this.binaryData = undefined;
  }

  /**
   * Deletes this leaf and all its contents
   * @returns A Delete result for this leaf
   *
   * ```typescript
   * const result = await container.leaf();
   * if (!result.isError) {
   *   // Do something
   * }
   * ```
   */
  async delete(): Promise<DeleteResult> {
    return this.handleDelete();
  }

  /**
   * ===========================================================================
   * CREATE METHODS
   * ===========================================================================
   */

  /**
   * A helper method updates this leaf's internal state upon create success
   * @param _result - the result of the create success
   */
  protected updateWithCreateSuccess(_result: ResourceSuccess): void {
    this.binaryData = undefined;
  }

  /**
   * Creates a leaf at this URI and overwrites any that already exists
   * @returns LeafCreateAndOverwriteResult
   *
   * @example
   * ```typescript
   * const result = await leaf.createAndOverwrite();
   * if (!result.isError) {
   *   // Do something
   * }
   * ```
   */
  async createAndOverwrite(): Promise<
    ResourceResult<LeafCreateAndOverwriteResult, Leaf>
  > {
    const createResult =
      (await this.handleCreateAndOverwrite()) as LeafCreateAndOverwriteResult;
    if (createResult.isError) return createResult;
    return { ...createResult, resource: this };
  }

  /**
   * Creates a leaf at this URI if the leaf doesn't already exist
   * @returns LeafCreateIfAbsentResult
   *
   * @example
   * ```typescript
   * const result = await leaf.createIfAbsent();
   * if (!result.isError) {
   *   // Do something
   * }
   * ```
   */
  async createIfAbsent(): Promise<
    ResourceResult<LeafCreateIfAbsentResult, Leaf>
  > {
    const createResult =
      (await this.handleCreateIfAbsent()) as LeafCreateIfAbsentResult;
    if (createResult.isError) return createResult;
    return { ...createResult, resource: this };
  }

  /**
   * ===========================================================================
   * UPLOAD METHODS
   * ===========================================================================
   */

  /**
   * Uploads a binary resource to this URI. If there is already a resource
   * present at this URI, it will be overwritten
   *
   * @param blob - the Blob of the binary
   * @param mimeType - the MimeType of the binary
   * @returns A LeafCreateAndOverwriteResult
   *
   * @example
   * ```typescript
   * const result = await leaf.uploadAndOverwrite(
   *   new Blob("some text."),
   *   "text/txt",
   * );
   * if (!result.isError) {
   *   // Do something
   * }
   * ```
   */
  async uploadAndOverwrite(
    blob: Blob,
    mimeType: string,
  ): Promise<ResourceResult<LeafCreateAndOverwriteResult, Leaf>> {
    const result = await this.requester.upload(blob, mimeType, true);
    this.status = result;
    if (result.isError) return result;
    super.updateWithCreateSuccess(result);
    this.binaryData = { blob, mimeType };
    this.emitThisAndParent();
    return { ...result, resource: this };
  }

  /**
   * Uploads a binary resource to this URI tf there not is already a resource
   * present at this URI.
   *
   * @param blob - the Blob of the binary
   * @param mimeType - the MimeType of the binary
   * @returns A LeafCreateIfAbsentResult
   *
   * @example
   * ```typescript
   * const result = await leaf.uploadIfAbsent(
   *   new Blob("some text."),
   *   "text/txt",
   * );
   * if (!result.isError) {
   *   // Do something
   * }
   * ```
   */
  async uploadIfAbsent(
    blob: Blob,
    mimeType: string,
  ): Promise<ResourceResult<LeafCreateIfAbsentResult, Leaf>> {
    const result = await this.requester.upload(blob, mimeType);
    this.status = result;
    if (result.isError) return result;
    super.updateWithCreateSuccess(result);
    this.binaryData = { blob, mimeType };
    this.emitThisAndParent();
    return { ...result, resource: this };
  }

  /**
   * ===========================================================================
   * UPDATE METHODS
   * ===========================================================================
   */

  /**
   * Updates a data resource with the changes provided
   * @param changes - Dataset changes that will be applied to the resoruce
   * @returns An UpdateResult
   *
   * @example
   * ```typescript
   * import {
   *   updateDataResource,
   *   transactionChanges,
   *   changeData,
   *   createSolidLdoDataset,
   * } from "@ldo/solid";
   *
   * //...
   *
   * // Get a Linked Data Object
   * const profile = solidLdoDataset
   *   .usingType(ProfileShapeType)
   *   .fromSubject("https://example.com/profile#me");
   * cosnt resource = solidLdoDataset
   *   .getResource("https://example.com/profile");
   * // Create a transaction to change data
   * const cProfile = changeData(profile, resource);
   * cProfile.name = "John Doe";
   * // Get data in "DatasetChanges" form
   * const datasetChanges = transactionChanges(someLinkedDataObject);
   * // Use "update" to apply the changes
   * cosnt result = resource.update(datasetChanges);
   * ```
   */
  async update(
    changes: DatasetChanges<Quad>,
  ): Promise<ResourceResult<UpdateResult, Leaf>> {
    const result = await this.requester.updateDataResource(changes);
    this.status = result;
    if (result.isError) return result;
    this.binaryData = undefined;
    this.absent = false;
    this.emitThisAndParent();
    return { ...result, resource: this };
  }
}
