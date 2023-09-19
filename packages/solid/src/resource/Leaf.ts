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
import {
  BinaryReadSuccess,
  DataReadSuccess,
  AbsentReadSuccess,
} from "../requester/results/success/ReadSuccess";
import type { ResourceSuccess } from "../requester/results/success/SuccessResult";
import { Unfetched } from "../requester/results/success/Unfetched";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import { getParentUri } from "../util/rdfUtils";
import type { LeafUri } from "../util/uriTypes";
import type { Container } from "./Container";
import type { SharedStatuses } from "./Resource";
import { Resource } from "./Resource";
import type { GetRootContainerSuccess } from "./resourceResults/GetRootContainerSuccess";

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
    this.status = new Unfetched(this.uri);
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

  async read(): Promise<ReadLeafResult> {
    return (await super.read()) as ReadLeafResult;
  }

  protected toReadResult(): ReadLeafResult {
    if (this.isAbsent()) {
      return new AbsentReadSuccess(this.uri, true);
    } else if (this.isBinary()) {
      return new BinaryReadSuccess(
        this.uri,
        true,
        this.binaryData!.blob,
        this.binaryData!.mimeType,
      );
    } else {
      return new DataReadSuccess(this.uri, true);
    }
  }

  async readIfUnfetched(): Promise<ReadLeafResult> {
    return super.readIfUnfetched() as Promise<ReadLeafResult>;
  }

  // Parent Container Methods
  getParentContainer(): Container {
    const parentUri = getParentUri(this.uri)!;
    return this.context.resourceStore.get(parentUri);
  }
  getRootContainer(): Promise<GetRootContainerSuccess | CheckRootResultError> {
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
  ): Promise<LeafCreateAndOverwriteResult> {
    const result = await this.requester.upload(blob, mimeType, true);
    this.status = result;
    if (result.isError) return result;
    super.updateWithCreateSuccess(result);
    this.binaryData = { blob, mimeType };
    this.emitThisAndParent();
    return result;
  }

  async uploadIfAbsent(
    blob: Blob,
    mimeType: string,
  ): Promise<LeafCreateIfAbsentResult> {
    const result = await this.requester.upload(blob, mimeType);
    this.status = result;
    if (result.isError) return result;
    super.updateWithCreateSuccess(result);
    this.binaryData = { blob, mimeType };
    this.emitThisAndParent();
    return result;
  }

  async update(changes: DatasetChanges<Quad>): Promise<UpdateResult> {
    const result = await this.requester.updateDataResource(changes);
    this.status = result;
    if (result.isError) return result;
    this.binaryData = undefined;
    this.absent = false;
    this.emitThisAndParent();
    return result;
  }

  async delete(): Promise<DeleteResult> {
    return this.handleDelete();
  }
}
