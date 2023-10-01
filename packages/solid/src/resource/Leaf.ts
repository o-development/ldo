import type { DatasetChanges } from "@ldo/rdf-utils";
import type { Quad } from "@rdfjs/types";
import { LeafRequester } from "../requester/LeafRequester";
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

export class Leaf extends Resource {
  readonly uri: LeafUri;
  protected requester: LeafRequester;
  readonly type = "leaf" as const;
  readonly isError = false as const;
  status:
    | SharedStatuses
    | ReadLeafResult
    | LeafCreateAndOverwriteResult
    | LeafCreateIfAbsentResult
    | UpdateResult;

  protected binaryData: { blob: Blob; mimeType: string } | undefined;

  constructor(uri: LeafUri, context: SolidLdoDatasetContext) {
    super(context);
    this.uri = uri;
    this.requester = new LeafRequester(uri, context);
    this.status = { isError: false, type: "unfetched", uri };
  }

  // Getters
  isUploading(): boolean {
    return this.requester.isUploading();
  }
  isUpdating(): boolean {
    return this.requester.isUpdating();
  }
  getMimeType(): string | undefined {
    return this.binaryData?.mimeType;
  }
  getBlob(): Blob | undefined {
    return this.binaryData?.blob;
  }
  isBinary(): boolean | undefined {
    if (!this.didInitialFetch) {
      return undefined;
    }
    return !!this.binaryData;
  }
  isDataResource(): boolean | undefined {
    if (!this.didInitialFetch) {
      return undefined;
    }
    return !this.binaryData;
  }

  // Read Methods
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

  async read(): Promise<ResourceResult<ReadLeafResult, Leaf>> {
    const result = (await this.handleRead()) as ReadLeafResult;
    if (result.isError) return result;
    return { ...result, resource: this };
  }

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

  async readIfUnfetched(): Promise<ResourceResult<ReadLeafResult, Leaf>> {
    return super.readIfUnfetched() as Promise<
      ResourceResult<ReadLeafResult, Leaf>
    >;
  }

  // Parent Container Methods
  getParentContainer(): Container {
    const parentUri = getParentUri(this.uri)!;
    return this.context.resourceStore.get(parentUri);
  }
  getRootContainer(): Promise<Container | CheckRootResultError> {
    const parentUri = getParentUri(this.uri)!;
    const parent = this.context.resourceStore.get(parentUri);
    return parent.getRootContainer();
  }

  // Delete Methods
  protected updateWithDeleteSuccess(_result: DeleteSuccess) {
    this.binaryData = undefined;
  }

  // Create Methods
  protected updateWithCreateSuccess(_result: ResourceSuccess): void {
    this.binaryData = undefined;
  }

  // Upload Methods
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

  async delete(): Promise<DeleteResult> {
    return this.handleDelete();
  }

  async createAndOverwrite(): Promise<
    ResourceResult<LeafCreateAndOverwriteResult, Leaf>
  > {
    const createResult =
      (await this.handleCreateAndOverwrite()) as LeafCreateAndOverwriteResult;
    if (createResult.isError) return createResult;
    return { ...createResult, resource: this };
  }

  async createIfAbsent(): Promise<
    ResourceResult<LeafCreateIfAbsentResult, Leaf>
  > {
    const createResult =
      (await this.handleCreateIfAbsent()) as LeafCreateIfAbsentResult;
    if (createResult.isError) return createResult;
    return { ...createResult, resource: this };
  }
}
