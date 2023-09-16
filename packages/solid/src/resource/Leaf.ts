import type { DatasetChanges } from "@ldo/rdf-utils";
import { LeafRequester } from "../requester/LeafRequester";
import type { Requester } from "../requester/Requester";
import type { AbsentResult } from "../requester/requestResults/AbsentResult";
import type { BinaryResult } from "../requester/requestResults/BinaryResult";
import type { DataResult } from "../requester/requestResults/DataResult";
import type { ErrorResult } from "../requester/requestResults/ErrorResult";
import type { CheckRootResultError } from "../requester/requests/checkRootContainer";
import type { DeleteResultError } from "../requester/requests/deleteResource";
import type { UpdateResultError } from "../requester/requests/updateDataResource";
import type {
  UploadResultError,
  UploadResultWithoutOverwriteError,
} from "../requester/requests/uploadResource";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import { getParentUri } from "../util/rdfUtils";
import type { LeafUri } from "../util/uriTypes";
import type { Container } from "./Container";
import { Resource } from "./Resource";

export class Leaf extends Resource {
  protected requester: Requester;
  readonly type = "leaf" as const;

  protected binaryData: { data: Blob; mimeType: string } | undefined;

  constructor(uri: LeafUri, context: SolidLdoDatasetContext) {
    super(uri, context);
    this.requester = new LeafRequester(uri, context);
  }

  protected parseResult<PossibleErrors extends ErrorResult>(
    result: AbsentResult | BinaryResult | DataResult | PossibleErrors,
  ): this | PossibleErrors {
    if (result.type === "binary") {
      this.binaryData = {
        data: result.blob,
        mimeType: result.mimeType,
      };
    } else {
      delete this.binaryData;
    }
    return super.parseResult(result);
  }

  getParentContainer(): Container {
    const parentUri = getParentUri(this.uri)!;
    return this.context.resourceStore.get(parentUri);
  }
  getRootContainer(): Promise<Container | CheckRootResultError> {
    const parentUri = getParentUri(this.uri)!;
    const parent = this.context.resourceStore.get(parentUri);
    return parent.getRootContainer();
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

  async uploadAndOverwrite(
    blob: Blob,
    mimeType: string,
  ): Promise<this | UploadResultError> {
    return this.parseResult(await this.requester.upload(blob, mimeType, true));
  }

  async uploadIfAbsent(
    blob: Blob,
    mimeType: string,
  ): Promise<this | UploadResultWithoutOverwriteError> {
    return this.parseResult(await this.requester.upload(blob, mimeType));
  }

  update(_changes: DatasetChanges): Promise<this | UpdateResultError> {
    throw new Error("Method not implemented");
  }

  // Delete Method
  async delete(): Promise<this | DeleteResultError> {
    return this.parseResult(await this.requester.delete());
  }
}
