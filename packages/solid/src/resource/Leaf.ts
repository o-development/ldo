import type { DatasetChanges } from "@ldo/rdf-utils";
import { LeafRequester } from "../requester/LeafRequester";
import type { Requester } from "../requester/Requester";
import type { CheckRootResultError } from "../requester/requests/checkRootContainer";
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

  constructor(uri: LeafUri, context: SolidLdoDatasetContext) {
    super(uri, context);
    this.requester = new LeafRequester(uri, context);
  }

  getParentContainer(): Promise<Container | undefined> {
    throw new Error("Method not implemented.");
  }
  getRootContainer(): Promise<Container | CheckRootResultError> {
    const parentUri = getParentUri(this.uri)!;
    const parent = this.context.resourceStore.get(parentUri);
    return parent.getRootContainer();
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
