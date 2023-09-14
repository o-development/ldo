// import type { LdoDataset } from "@ldo/ldo";
// import type { LeafMethodNotAllowedError } from "./error/MethodNotAllowedError";
// import type { DatasetChanges } from "@ldo/rdf-utils";
// import type { PresentContainer } from "./abstract/container/PresentContainer";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import { LeafRequester } from "../requester/LeafRequester";
import type { AbsentResult } from "../requester/requestResults/AbsentResult";
import type { BinaryResult } from "../requester/requestResults/BinaryResult";
import type { DataResult } from "../requester/requestResults/DataResult";
import {
  UnexpectedError,
  type ErrorResult,
} from "../requester/requestResults/ErrorResult";
import type {
  CreateResultErrors,
  CreateResultWithoutOverwriteErrors,
} from "../requester/requests/createDataResource";
import type { DeleteResultError } from "../requester/requests/deleteResource";
import type { ReadResultError } from "../requester/requests/readResource";
import type {
  UploadResultError,
  UploadResultWithoutOverwriteError,
} from "../requester/requests/uploadResource";
import type { LeafUri } from "../uriTypes";

export interface ConcreteInstance {
  uri: LeafUri;
  context: SolidLdoDatasetContext;
  // methods: typeof AbstractLeaf;
}

// REMEMBER: This file should be replaced with non abstract methods
export class Resource {
  // All intance variables
  private readonly context: SolidLdoDatasetContext;
  readonly uri: string;
  private readonly requester: LeafRequester;
  private didInitialFetch: boolean = false;
  private absent: boolean | undefined;
  private binaryData: { data: Blob; mimeType: string } | undefined;

  constructor(uri: string, context: SolidLdoDatasetContext) {
    this.uri = uri;
    this.context = context;
    this.requester = new LeafRequester(uri as LeafUri, context);
  }

  // Loading Methods
  isLoading(): boolean {
    return this.requester.isLoading();
  }
  isCreating(): boolean {
    return this.requester.isCreating();
  }
  isUploading(): boolean {
    return this.requester.isUploading();
  }
  isReading(): boolean {
    return this.requester.isReading();
  }
  isUpdating(): boolean {
    return this.requester.isUpdating();
  }
  isDeleting(): boolean {
    return this.requester.isDeletinng();
  }
  isDoingInitialFetch(): boolean {
    return this.isReading() && !this.isFetched();
  }

  // Checkers
  isFetched(): boolean {
    return this.didInitialFetch;
  }
  isUnfetched(): boolean {
    return !this.didInitialFetch;
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

  private parseResult(
    result: AbsentResult | BinaryResult | DataResult | ErrorResult,
  ) {
    switch (result.type) {
      case "error":
        return result;
      case "absent":
        this.didInitialFetch = true;
        this.absent = true;
        delete this.binaryData;
        return this;
      case "data":
        this.didInitialFetch = true;
        this.absent = false;
        delete this.binaryData;
        return this;
      case "binary":
        this.didInitialFetch = true;
        this.absent = false;
        this.binaryData = {
          data: result.blob,
          mimeType: result.mimeType,
        };
      default:
        return new UnexpectedError(
          this.uri,
          new Error("Unknown request result"),
        );
    }
  }

  // Read Methods
  async read(): Promise<Resource | ReadResultError> {
    return this.parseResult(await this.requester.read()) as
      | Resource
      | ReadResultError;
  }
  async readIfUnfetched(): Promise<Resource | ReadResultError> {
    if (this.didInitialFetch) {
      return this;
    }
    return this.read();
  }

  // Create Methods
  async createAndOverwrite(): Promise<Resource | CreateResultErrors> {
    return this.parseResult(await this.requester.createDataResource(true)) as
      | Resource
      | CreateResultErrors;
  }

  async createIfAbsent(): Promise<
    Resource | CreateResultWithoutOverwriteErrors
  > {
    return this.parseResult(await this.requester.createDataResource()) as
      | Resource
      | CreateResultWithoutOverwriteErrors;
  }

  async uploadAndOverwrite(
    blob: Blob,
    mimeType: string,
  ): Promise<Resource | UploadResultError> {
    return this.parseResult(await this.requester.upload(blob, mimeType)) as
      | Resource
      | UploadResultError;
  }

  async uploadIfAbsent(
    blob: Blob,
    mimeType: string,
  ): Promise<Resource | UploadResultWithoutOverwriteError> {
    return this.parseResult(
      await this.requester.upload(blob, mimeType, true),
    ) as Resource | UploadResultWithoutOverwriteError;
  }

  // Delete Method
  async delete(): Promise<Resource | DeleteResultError> {
    return this.parseResult(await this.requester.delete()) as
      | Resource
      | DeleteResultError;
  }

  // Parent Container Methods -- Remember to change for Container
  abstract getCachedParentContainer(): ContainerType | LdoSolidError;
  abstract getParentContainer(): Resource;
  abstract getRootContainerFromCache():
    | ContainerType
    | undefined
    | LdoSolidError;
  abstract getRootContainer(): Promise<
    FetchedContainerType | undefined | LdoSolidError
  >;
  abstract getRootContainerFromPod(): Promise<
    FetchedContainerType | undefined | LdoSolidError
  >;
  // Exclusing Methods =========================================================
  // Data Methods (Data Leaf Only)
  abstract getLdoDataset(): LdoDataset | LeafMethodNotAllowedError;
  abstract reloadLdoDataset(): Promise<LdoDataset | LeafMethodNotAllowedError>;
  abstract hasData(): boolean | LeafMethodNotAllowedError;
  abstract reloadHasData(): Promise<boolean | LeafMethodNotAllowedError>;
  abstract update(
    changes: DatasetChanges,
  ): Promise<DataLeaf | LdoSolidError | LeafMethodNotAllowedError>;
  // Binary Methods (Binary Only)
  abstract getMimeType(): string | LeafMethodNotAllowedError;
  abstract reloadMimeType(): Promise<string | LeafMethodNotAllowedError>;
}
