import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import type {
  ContainerCreateAndOverwriteResult,
  ContainerCreateIfAbsentResult,
  LeafCreateAndOverwriteResult,
  LeafCreateIfAbsentResult,
} from "../requester/requests/createDataResource";
import type {
  ReadContainerResult,
  ReadLeafResult,
} from "../requester/requests/readResource";
import type { Requester } from "../requester/Requester";
import type { CheckRootResultError } from "../requester/requests/checkRootContainer";
import type { AccessRule } from "../requester/results/success/AccessRule";
import type { SetAccessRulesResult } from "../requester/requests/setAccessRules";
import { setAccessRules } from "../requester/requests/setAccessRules";
import type TypedEmitter from "typed-emitter";
import EventEmitter from "events";
import { getParentUri } from "../util/rdfUtils";
import type { RequesterResult } from "../requester/results/RequesterResult";
import type { DeleteResult } from "../requester/requests/deleteResource";
import { ReadSuccess } from "../requester/results/success/ReadSuccess";
import type { DeleteSuccess } from "../requester/results/success/DeleteSuccess";
import type { ResourceSuccess } from "../requester/results/success/SuccessResult";
import type { Unfetched } from "../requester/results/success/Unfetched";
import type { CreateSuccess } from "../requester/results/success/CreateSuccess";
import type { GetRootContainerSuccess } from "./resourceResults/GetRootContainerSuccess";
import type {
  ReadResourceSuccessContainerTypes,
  ReadResourceSuccessLeafTypes,
} from "./resourceResults/ReadResourceSuccess";

export type SharedStatuses = Unfetched | DeleteResult | CreateSuccess;

export abstract class Resource extends (EventEmitter as new () => TypedEmitter<{
  update: () => void;
}>) {
  // All intance variables
  protected readonly context: SolidLdoDatasetContext;
  abstract readonly uri: string;
  abstract readonly type: string;
  abstract status: RequesterResult;
  protected abstract readonly requester: Requester;
  protected didInitialFetch: boolean = false;
  protected absent: boolean | undefined;

  constructor(context: SolidLdoDatasetContext) {
    super();
    this.context = context;
  }

  // Loading Methods
  isLoading(): boolean {
    return this.requester.isLoading();
  }
  isCreating(): boolean {
    return this.requester.isCreating();
  }
  isReading(): boolean {
    return this.requester.isReading();
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

  // Helper Methods
  protected emitThisAndParent() {
    this.emit("update");
    const parentUri = getParentUri(this.uri);
    if (parentUri) {
      const parentContainer = this.context.resourceStore.get(parentUri);
      parentContainer.emit("update");
    }
  }

  // Read Methods
  protected updateWithReadSuccess(result: ReadSuccess) {
    this.absent = result.type === "absentReadSuccess";
    this.didInitialFetch = true;
  }

  async read(): Promise<
    ReadResourceSuccessContainerTypes | ReadResourceSuccessLeafTypes
  > {
    const result = await this.requester.read();
    this.status = result;
    if (result.isError) return result;
    this.updateWithReadSuccess(result);
    this.emitThisAndParent();
    return result;
  }

  protected abstract toReadResult(): ReadContainerResult | ReadLeafResult;

  async readIfUnfetched(): Promise<ReadContainerResult | ReadLeafResult> {
    if (this.didInitialFetch) {
      const readResult = this.toReadResult();
      this.status = readResult;
      return readResult;
    }
    return this.read();
  }

  // Delete Methods
  protected updateWithDeleteSuccess(_result: DeleteSuccess) {
    this.absent = true;
    this.didInitialFetch = true;
  }

  protected async handleDelete(): Promise<DeleteResult> {
    const result = await this.requester.delete();
    this.status = result;
    if (result.isError) return result;
    this.updateWithDeleteSuccess(result);
    this.emitThisAndParent();
    return result;
  }

  // Create Methods
  protected updateWithCreateSuccess(result: ResourceSuccess) {
    this.absent = false;
    this.didInitialFetch = true;
    if (result instanceof ReadSuccess) {
      this.updateWithReadSuccess(result);
    }
  }

  async createAndOverwrite(): Promise<
    ContainerCreateAndOverwriteResult | LeafCreateAndOverwriteResult
  > {
    const result = await this.requester.createDataResource(true);
    this.status = result;
    if (result.isError) return result;
    this.updateWithCreateSuccess(result);
    this.emitThisAndParent();
    return result;
  }

  async createIfAbsent(): Promise<
    ContainerCreateIfAbsentResult | LeafCreateIfAbsentResult
  > {
    const result = await this.requester.createDataResource(true);
    this.status = result;
    if (result.isError) return result;
    this.updateWithCreateSuccess(result);
    this.emitThisAndParent();
    return result;
  }

  // Parent Container Methods -- Remember to change for Container
  abstract getRootContainer(): Promise<
    GetRootContainerSuccess | CheckRootResultError
  >;

  // Access Rules Methods
  // async getAccessRules(): Promise<AccessRuleResult | AccessRuleFetchError> {
  //   return getAccessRules({ uri: this.uri, fetch: this.context.fetch });
  // }

  async setAccessRules(
    newAccessRules: AccessRule,
  ): Promise<SetAccessRulesResult> {
    return setAccessRules(this.uri, newAccessRules, {
      fetch: this.context.fetch,
    });
  }
}
