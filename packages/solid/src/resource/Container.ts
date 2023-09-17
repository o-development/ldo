import { namedNode } from "@rdfjs/data-model";
import { ContainerRequester } from "../requester/ContainerRequester";
import {
  AggregateError,
  UnexpectedError,
} from "../requester/requestResults/ErrorResult";
import type { CheckRootResultError } from "../requester/requests/checkRootContainer";
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
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import { getParentUri, ldpContains } from "../util/rdfUtils";
import type { ContainerUri, LeafUri } from "../util/uriTypes";
import type { Leaf } from "./Leaf";
import { Resource } from "./Resource";

export class Container extends Resource {
  readonly uri: ContainerUri;
  protected requester: ContainerRequester;
  protected rootContainer: boolean | undefined;
  readonly type = "container" as const;

  constructor(uri: ContainerUri, context: SolidLdoDatasetContext) {
    super(context);
    this.uri = uri;
    this.requester = new ContainerRequester(uri, context);
  }

  isRootContainer(): boolean | undefined {
    return this.rootContainer;
  }

  private async checkIfIsRootContainer(): Promise<
    CheckRootResultError | undefined
  > {
    if (this.rootContainer === undefined) {
      const rootContainerResult = await this.requester.isRootContainer();
      if (typeof rootContainerResult !== "boolean") {
        return rootContainerResult;
      }
      this.rootContainer = rootContainerResult;
    }
  }

  async getParentContainer(): Promise<
    Container | CheckRootResultError | undefined
  > {
    const checkResult = await this.checkIfIsRootContainer();
    if (checkResult) return checkResult;
    if (this.rootContainer) return undefined;
    const parentUri = getParentUri(this.uri);
    if (!parentUri) {
      return new UnexpectedError(
        this.uri,
        new Error("Resource does not have a root container"),
      );
    }
    return this.context.resourceStore.get(parentUri);
  }

  async getRootContainer(): Promise<Container | CheckRootResultError> {
    const checkResult = await this.checkIfIsRootContainer();
    if (checkResult) return checkResult;
    if (this.rootContainer) {
      return this;
    }
    const parentUri = getParentUri(this.uri);
    if (!parentUri) {
      return new UnexpectedError(
        this.uri,
        new Error("Resource does not have a root container"),
      );
    }
    return this.context.resourceStore.get(parentUri).getRootContainer();
  }

  children(): (Leaf | Container)[] {
    const childQuads = this.context.solidLdoDataset.match(
      namedNode(this.uri),
      ldpContains,
      null,
      namedNode(this.uri),
    );
    return childQuads.toArray().map((childQuad) => {
      return this.context.resourceStore.get(childQuad.object.value);
    });
  }

  child(slug: ContainerUri): Container;
  child(slug: LeafUri): Leaf;
  child(slug: string): Leaf | Container;
  child(slug: string): Leaf | Container {
    return this.context.resourceStore.get(`${this.uri}${slug}`);
  }

  createChildAndOverwrite(
    slug: ContainerUri,
  ): Promise<Container | CreateResultErrors>;
  createChildAndOverwrite(slug: LeafUri): Promise<Leaf | CreateResultErrors>;
  createChildAndOverwrite(slug: string): Promise<Resource | CreateResultErrors>;
  createChildAndOverwrite(
    slug: string,
  ): Promise<Resource | CreateResultErrors> {
    return this.child(slug).createAndOverwrite();
  }

  createChildIfAbsent(
    slug: ContainerUri,
  ): Promise<Container | CreateResultWithoutOverwriteErrors>;
  createChildIfAbsent(
    slug: LeafUri,
  ): Promise<Leaf | CreateResultWithoutOverwriteErrors>;
  createChildIfAbsent(
    slug: string,
  ): Promise<Container | Leaf | CreateResultWithoutOverwriteErrors>;
  createChildIfAbsent(
    slug: string,
  ): Promise<Container | Leaf | CreateResultWithoutOverwriteErrors> {
    return this.child(slug).createIfAbsent();
  }

  async uploadChildAndOverwrite(
    slug: string,
    blob: Blob,
    mimeType: string,
  ): Promise<Leaf | UploadResultError> {
    const child = this.child(slug);
    if (child.type === "leaf") {
      return child.uploadAndOverwrite(blob, mimeType);
    }
    return new UnexpectedError(
      child.uri,
      new Error(`${slug} is not a leaf uri.`),
    );
  }

  async uploadIfAbsent(
    slug: string,
    blob: Blob,
    mimeType: string,
  ): Promise<Leaf | UploadResultWithoutOverwriteError> {
    const child = this.child(slug);
    if (child.type === "leaf") {
      return child.uploadIfAbsent(blob, mimeType);
    }
    return new UnexpectedError(
      child.uri,
      new Error(`${slug} is not a leaf uri.`),
    );
  }

  async clear(): Promise<
    AggregateError<DeleteResultError | ReadResultError> | this
  > {
    const readResult = await this.read();
    if (readResult.type === "error")
      return new AggregateError(this.uri, [readResult]);
    const errors = (
      await Promise.all(
        this.children().map(async (child) => {
          const deleteError = await child.delete();
          if (deleteError.type === "error") return deleteError;
        }),
      )
    )
      .flat()
      .filter(
        (
          value,
        ): value is
          | DeleteResultError
          | AggregateError<DeleteResultError | ReadResultError> => !!value,
      );
    if (errors.length > 0) {
      return new AggregateError(this.uri, errors);
    }
    return this;
  }

  async delete(): Promise<
    | this
    | AggregateError<ReadResultError | DeleteResultError>
    | DeleteResultError
  > {
    const clearResult = await this.clear();
    if (clearResult.type === "error") return clearResult;
    return this.parseResult(await this.requester.delete()) as
      | this
      | DeleteResultError;
  }
}
