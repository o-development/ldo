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
import type { AbsentReadSuccess } from "../requester/results/success/ReadSuccess";
import type { ContainerReadSuccess } from "../requester/results/success/ReadSuccess";
import type { AggregateSuccess } from "../requester/results/success/SuccessResult";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import { getParentUri, ldpContains } from "../util/rdfUtils";
import type { ContainerUri, LeafUri } from "../util/uriTypes";
import type { Leaf } from "./Leaf";
import type { SharedStatuses } from "./Resource";
import { Resource } from "./Resource";
import type { ResourceResult } from "./resourceResult/ResourceResult";

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
    this.status = { isError: false, type: "unfetched", uri };
  }

  isRootContainer(): boolean | undefined {
    return this.rootContainer;
  }

  // Read Methods
  protected updateWithReadSuccess(
    result: ContainerReadSuccess | AbsentReadSuccess,
  ): void {
    super.updateWithReadSuccess(result);
    if (result.type === "containerReadSuccess") {
      this.rootContainer = result.isRootContainer;
    }
  }

  async read(): Promise<ResourceResult<ReadContainerResult, Container>> {
    const result = (await this.handleRead()) as ReadContainerResult;
    if (result.isError) return result;
    return { ...result, resource: this };
  }

  protected toReadResult(): ResourceResult<ReadContainerResult, Container> {
    if (this.isAbsent()) {
      return {
        isError: false,
        type: "absentReadSuccess",
        uri: this.uri,
        recalledFromMemory: true,
        resource: this,
      };
    } else {
      return {
        isError: false,
        type: "containerReadSuccess",
        uri: this.uri,
        recalledFromMemory: true,
        isRootContainer: this.isRootContainer()!,
        resource: this,
      };
    }
  }

  async readIfUnfetched(): Promise<
    ResourceResult<ReadContainerResult, Container>
  > {
    return super.readIfUnfetched() as Promise<
      ResourceResult<ReadContainerResult, Container>
    >;
  }

  // Parent Container Methods
  private async checkIfIsRootContainer(): Promise<
    ResourceResult<CheckRootResult, Container>
  > {
    const rootContainerResult = await this.requester.isRootContainer();
    this.status = rootContainerResult;
    if (rootContainerResult.isError) return rootContainerResult;
    this.rootContainer = rootContainerResult.isRootContainer;
    this.emit("update");
    return { ...rootContainerResult, resource: this };
  }

  async getRootContainer(): Promise<Container | CheckRootResultError> {
    if (this.rootContainer === undefined) {
      const checkResult = await this.checkIfIsRootContainer();
      if (checkResult.isError) return checkResult;
    }
    if (this.rootContainer === true) {
      return this;
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
  ): Promise<ResourceResult<ContainerCreateAndOverwriteResult, Container>>;
  createChildAndOverwrite(
    slug: LeafUri,
  ): Promise<ResourceResult<LeafCreateAndOverwriteResult, Leaf>>;
  createChildAndOverwrite(
    slug: string,
  ): Promise<
    ResourceResult<
      ContainerCreateAndOverwriteResult | LeafCreateAndOverwriteResult,
      Leaf | Container
    >
  >;
  createChildAndOverwrite(
    slug: string,
  ): Promise<
    ResourceResult<
      ContainerCreateAndOverwriteResult | LeafCreateAndOverwriteResult,
      Leaf | Container
    >
  > {
    return this.child(slug).createAndOverwrite();
  }

  createChildIfAbsent(
    slug: ContainerUri,
  ): Promise<ResourceResult<ContainerCreateIfAbsentResult, Container>>;
  createChildIfAbsent(
    slug: LeafUri,
  ): Promise<ResourceResult<LeafCreateIfAbsentResult, Leaf>>;
  createChildIfAbsent(
    slug: string,
  ): Promise<
    ResourceResult<
      ContainerCreateIfAbsentResult | LeafCreateIfAbsentResult,
      Leaf | Container
    >
  >;
  createChildIfAbsent(
    slug: string,
  ): Promise<
    ResourceResult<
      ContainerCreateIfAbsentResult | LeafCreateIfAbsentResult,
      Leaf | Container
    >
  > {
    return this.child(slug).createIfAbsent();
  }

  async uploadChildAndOverwrite(
    slug: LeafUri,
    blob: Blob,
    mimeType: string,
  ): Promise<ResourceResult<LeafCreateAndOverwriteResult, Leaf>> {
    return this.child(slug).uploadAndOverwrite(blob, mimeType);
  }

  async uploadChildIfAbsent(
    slug: LeafUri,
    blob: Blob,
    mimeType: string,
  ): Promise<ResourceResult<LeafCreateIfAbsentResult, Leaf>> {
    return this.child(slug).uploadIfAbsent(blob, mimeType);
  }

  async clear(): Promise<
    ResourceResult<
      | AggregateSuccess<ResourceResult<DeleteSuccess, Container | Leaf>>
      | AggregateError<DeleteResultError | ReadResultError>,
      Container
    >
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
    return {
      isError: false,
      type: "aggregateSuccess",
      results: results as ResourceResult<DeleteSuccess, Container | Leaf>[],
      resource: this,
    };
  }

  async delete(): Promise<
    ResourceResult<
      DeleteResult | AggregateError<DeleteResultError | ReadResultError>,
      Container
    >
  > {
    const clearResult = await this.clear();
    if (clearResult.isError) return clearResult;
    const deleteResult = await this.handleDelete();
    if (deleteResult.isError) return deleteResult;
    return { ...deleteResult, resource: this };
  }

  async createAndOverwrite(): Promise<
    ResourceResult<ContainerCreateAndOverwriteResult, Container>
  > {
    const createResult =
      (await this.handleCreateAndOverwrite()) as ContainerCreateAndOverwriteResult;
    if (createResult.isError) return createResult;
    return { ...createResult, resource: this };
  }

  async createIfAbsent(): Promise<
    ResourceResult<ContainerCreateIfAbsentResult, Container>
  > {
    const createResult =
      (await this.handleCreateIfAbsent()) as ContainerCreateIfAbsentResult;
    if (createResult.isError) return createResult;
    return { ...createResult, resource: this };
  }
}
