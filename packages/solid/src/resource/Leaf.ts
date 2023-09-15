import type { DatasetChanges } from "@ldo/rdf-utils";
import type { Requester } from "../requester/Requester";
import type { UpdateResultError } from "../requester/requests/updateDataResource";
import type {
  UploadResultError,
  UploadResultWithoutOverwriteError,
} from "../requester/requests/uploadResource";
import type { Container } from "./Container";
import { Resource } from "./Resource";

export class Leaf extends Resource {
  protected requester: Requester;
  getParentContainer(): Promise<Container | undefined> {
    throw new Error("Method not implemented.");
  }
  getRootContainer(): Promise<Container> {
    throw new Error("Method not implemented.");
  }
  getMimeType(): string {
    throw new Error("Method not implemented.");
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
    return this.parseResult(await this.requester.upload(blob, mimeType)) as
      | this
      | UploadResultError;
  }

  async uploadIfAbsent(
    blob: Blob,
    mimeType: string,
  ): Promise<this | UploadResultWithoutOverwriteError> {
    return this.parseResult(
      await this.requester.upload(blob, mimeType, true),
    ) as this | UploadResultWithoutOverwriteError;
  }

  update(_changes: DatasetChanges): Promise<this | UpdateResultError> {
    throw new Error("Method not implemented");
  }
}
