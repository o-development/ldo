import { namedNode } from "@rdfjs/data-model";
import { ContainerRequester } from "../requester/ContainerRequester";
import type {
  CheckRootResult,
  CheckRootResultError,
} from "../requester/requests/checkRootContainer";
import type {
  ContainerCreateAndOverwriteResult,
  ContainerCreateIfAbsentResult,
  LeafCreateAndOverwriteResult,
  LeafCreateIfAbsentResult,
} from "../requester/requests/createDataResource";
import type {
  DeleteResult,
  DeleteResultError,
} from "../requester/requests/deleteResource";
import type {
  ReadContainerResult,
  ReadResultError,
} from "../requester/requests/readResource";
import { AggregateError } from "../requester/results/error/ErrorResult";
import { NoncompliantPodError } from "../requester/results/error/NoncompliantPodError";
import type { DeleteSuccess } from "../requester/results/success/DeleteSuccess";
import {
  AbsentReadSuccess,
  ContainerReadSuccess,
} from "../requester/results/success/ReadSuccess";
import { AggregateSuccess } from "../requester/results/success/SuccessResult";
import { Unfetched } from "../requester/results/success/Unfetched";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import { getParentUri, ldpContains } from "../util/rdfUtils";
import type { ContainerUri, LeafUri } from "../util/uriTypes";
import type { Leaf } from "./Leaf";
import type { SharedStatuses } from "./Resource";
import { Resource } from "./Resource";
import { GetRootContainerSuccess } from "./resourceResults/GetRootContainerSuccess";

export class Container extends Resource {
  readonly uri: ContainerUri;
  protected requester: ContainerRequester;
  protected rootContainer: boolean | undefined;
  readonly type = "container" as const;
  readonly isError = false as const;
  status:
    | SharedStatuses
    | ReadContainerResult
    | ContainerCreateAndOverwriteResult
    | ContainerCreateIfAbsentResult
    | CheckRootResult;

  constructor(uri: ContainerUri, context: SolidLdoDatasetContext) {
    super(context);
    this.uri = uri;
    this.requester = new ContainerRequester(uri, context);
    this.status = new Unfetched(this.uri);
  }

  isRootContainer(): boolean | undefined {
    return this.rootContainer;
  }

  // Read Methods
  protected updateWithReadSuccess(
    result: ContainerReadSuccess | AbsentReadSuccess,
  ): void {
    if (result.type === "containerReadSuccess") {
      this.rootContainer = result.isRootContainer;
    }
  }

  async read(): Promise<ReadContainerResult> {
    return (await super.read()) as ReadContainerResult;
  }

  protected toReadResult(): ReadContainerResult {
    if (this.isAbsent()) {
      return new AbsentReadSuccess(this.uri, true);
    } else {
      return new ContainerReadSuccess(this.uri, true, this.isRootContainer()!);
    }
  }

  async readIfUnfetched(): Promise<ReadContainerResult> {
    return super.readIfUnfetched() as Promise<ReadContainerResult>;
  }

  // Parent Container Methods
  private async checkIfIsRootContainer(): Promise<CheckRootResult> {
    const rootContainerResult = await this.requester.isRootContainer();
    this.status = rootContainerResult;
    if (rootContainerResult.isError) return rootContainerResult;
    this.rootContainer = rootContainerResult.isRootContainer;
    this.emit("update");
    return rootContainerResult;
  }

  async getRootContainer(): Promise<
    GetRootContainerSuccess | CheckRootResultError
  > {
    const checkResult = await this.checkIfIsRootContainer();
    if (checkResult.isError) return checkResult;
    if (this.rootContainer) {
      return new GetRootContainerSuccess(this);
    }
    const parentUri = getParentUri(this.uri);
    if (!parentUri) {
      return new NoncompliantPodError(
        this.uri,
        "Resource does not have a root container",
      );
    }
    return this.context.resourceStore.get(parentUri).getRootContainer();
  }

  async getParentContainer(): Promise<
    Container | CheckRootResultError | undefined
  > {
    const checkResult = await this.checkIfIsRootContainer();
    if (checkResult.isError) return checkResult;
    if (this.rootContainer) return undefined;
    const parentUri = getParentUri(this.uri);
    if (!parentUri) {
      return new NoncompliantPodError(
        this.uri,
        `${this.uri} is not root does not have a parent container`,
      );
    }
    return this.context.resourceStore.get(parentUri);
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

  // Child Creators
  createChildAndOverwrite(
    slug: ContainerUri,
  ): Promise<ContainerCreateAndOverwriteResult>;
  createChildAndOverwrite(slug: LeafUri): Promise<LeafCreateAndOverwriteResult>;
  createChildAndOverwrite(
    slug: string,
  ): Promise<ContainerCreateAndOverwriteResult | LeafCreateAndOverwriteResult>;
  createChildAndOverwrite(
    slug: string,
  ): Promise<ContainerCreateAndOverwriteResult | LeafCreateAndOverwriteResult> {
    return this.child(slug).createAndOverwrite();
  }

  createChildIfAbsent(slug: ContainerUri): Promise<LeafCreateIfAbsentResult>;
  createChildIfAbsent(slug: LeafUri): Promise<LeafCreateIfAbsentResult>;
  createChildIfAbsent(
    slug: string,
  ): Promise<ContainerCreateIfAbsentResult | LeafCreateIfAbsentResult>;
  createChildIfAbsent(
    slug: string,
  ): Promise<ContainerCreateIfAbsentResult | LeafCreateIfAbsentResult> {
    return this.child(slug).createIfAbsent();
  }

  async uploadChildAndOverwrite(
    slug: LeafUri,
    blob: Blob,
    mimeType: string,
  ): Promise<LeafCreateAndOverwriteResult> {
    return this.child(slug).uploadAndOverwrite(blob, mimeType);
  }

  async uploadChildIfAbsent(
    slug: LeafUri,
    blob: Blob,
    mimeType: string,
  ): Promise<LeafCreateIfAbsentResult> {
    return this.child(slug).uploadIfAbsent(blob, mimeType);
  }

  async clear(): Promise<
    | AggregateSuccess<DeleteSuccess>
    | AggregateError<DeleteResultError | ReadResultError>
  > {
    const readResult = await this.read();
    if (readResult.isError) return new AggregateError([readResult]);
    const results = (
      await Promise.all(
        this.children().map(async (child) => {
          return child.delete();
        }),
      )
    ).flat();
    const errors = results.filter(
      (
        value,
      ): value is
        | DeleteResultError
        | AggregateError<DeleteResultError | ReadResultError> => value.isError,
    );
    if (errors.length > 0) {
      return new AggregateError(errors);
    }
    return new AggregateSuccess<DeleteSuccess>(results as DeleteSuccess[]);
  }

  async delete(): Promise<
    DeleteResult | AggregateError<DeleteResultError | ReadResultError>
  > {
    const clearResult = await this.clear();
    if (clearResult.isError) return clearResult;
    return this.handleDelete();
  }
}
