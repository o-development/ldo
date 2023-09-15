import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
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
import type { Container } from "./Container";
import type { Requester } from "../requester/Requester";

export abstract class Resource {
  // All intance variables
  protected readonly context: SolidLdoDatasetContext;
  readonly uri: string;
  protected abstract readonly requester: Requester;
  protected didInitialFetch: boolean = false;
  protected absent: boolean | undefined;
  protected binaryData: { data: Blob; mimeType: string } | undefined;

  constructor(uri: string, context: SolidLdoDatasetContext) {
    this.uri = uri;
    this.context = context;
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
  isAbsent(): boolean | undefined {
    return this.absent;
  }
  isPresent(): boolean | undefined {
    return this.absent === undefined ? undefined : !this.absent;
  }

  protected parseResult(
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
  async read(): Promise<this | ReadResultError> {
    return this.parseResult(await this.requester.read()) as
      | this
      | ReadResultError;
  }
  async readIfUnfetched(): Promise<this | ReadResultError> {
    if (this.didInitialFetch) {
      return this;
    }
    return this.read();
  }

  // Create Methods
  async createAndOverwrite(): Promise<this | CreateResultErrors> {
    return this.parseResult(await this.requester.createDataResource(true)) as
      | this
      | CreateResultErrors;
  }

  async createIfAbsent(): Promise<this | CreateResultWithoutOverwriteErrors> {
    return this.parseResult(await this.requester.createDataResource()) as
      | this
      | CreateResultWithoutOverwriteErrors;
  }

  // Delete Method
  async delete(): Promise<Resource | DeleteResultError> {
    return this.parseResult(await this.requester.delete()) as
      | Resource
      | DeleteResultError;
  }

  // Parent Container Methods -- Remember to change for Container
  abstract getParentContainer(): Promise<Container | undefined>;
  abstract getRootContainer(): Promise<Container>;
  // Exclusing Methods =========================================================
  // Data Methods (Data Leaf Only)

  // Binary Methods (Binary Only)
  abstract getMimeType(): string;
}
