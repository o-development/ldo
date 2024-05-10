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
import type { BatchedRequester } from "../requester/BatchedRequester";
import type { CheckRootResultError } from "../requester/requests/checkRootContainer";
import type TypedEmitter from "typed-emitter";
import EventEmitter from "events";
import { getParentUri } from "../util/rdfUtils";
import type { RequesterResult } from "../requester/results/RequesterResult";
import type { DeleteResult } from "../requester/requests/deleteResource";
import type { ReadSuccess } from "../requester/results/success/ReadSuccess";
import { isReadSuccess } from "../requester/results/success/ReadSuccess";
import type { DeleteSuccess } from "../requester/results/success/DeleteSuccess";
import type { ResourceSuccess } from "../requester/results/success/SuccessResult";
import type { Unfetched } from "../requester/results/success/Unfetched";
import type { CreateSuccess } from "../requester/results/success/CreateSuccess";
import type { ResourceResult } from "./resourceResult/ResourceResult";
import type { Container } from "./Container";
import type { Leaf } from "./Leaf";
import type { WacRule } from "./wac/WacRule";
import type { GetWacUriError, GetWacUriResult } from "./wac/getWacUri";
import { getWacUri } from "./wac/getWacUri";
import { getWacRuleWithAclUri, type GetWacRuleResult } from "./wac/getWacRule";
import { NoncompliantPodError } from "../requester/results/error/NoncompliantPodError";
import { setWacRuleForAclUri, type SetWacRuleResult } from "./wac/setWacRule";
import type { LeafUri } from "../util/uriTypes";
import type { NoRootContainerError } from "../requester/results/error/NoRootContainerError";

/**
 * Statuses shared between both Leaf and Container
 */
export type SharedStatuses = Unfetched | DeleteResult | CreateSuccess;

/**
 * Represents the current status of a specific Resource on a Pod as known by LDO.
 */
export abstract class Resource extends (EventEmitter as new () => TypedEmitter<{
  update: () => void;
}>) {
  /**
   * @internal
   * The SolidLdoDatasetContext from the Parent Dataset
   */
  protected readonly context: SolidLdoDatasetContext;

  /**
   * The uri of the resource
   */
  abstract readonly uri: string;

  /**
   * The type of resource (leaf or container)
   */
  abstract readonly type: string;

  /**
   * The status of the last request made for this resource
   */
  abstract status: RequesterResult;

  /**
   * @internal
   * Batched Requester for the Resource
   */
  protected abstract readonly requester: BatchedRequester;

  /**
   * @internal
   * True if this resource has been fetched at least once
   */
  protected didInitialFetch: boolean = false;

  /**
   * @internal
   * True if this resource has been fetched but does not exist
   */
  protected absent: boolean | undefined;

  /**
   * @internal
   * If a wac uri is fetched, it is cached here
   */
  protected wacUri?: LeafUri;

  /**
   * @internal
   * If a wac rule was fetched, it is cached here
   */
  protected wacRule?: WacRule;

  /**
   * @param context - SolidLdoDatasetContext for the parent dataset
   */
  constructor(context: SolidLdoDatasetContext) {
    super();
    this.context = context;
  }

  /**
   * ===========================================================================
   * GETTERS
   * ===========================================================================
   */

  /**
   * Checks to see if this resource is loading in any way
   * @returns true if the resource is currently loading
   *
   * @example
   * ```typescript
   * resource.read().then(() => {
   *   // Logs "false"
   *   console.log(resource.isLoading())
   * });
   * // Logs "true"
   * console.log(resource.isLoading());
   * ```
   */
  isLoading(): boolean {
    return this.requester.isLoading();
  }

  /**
   * Checks to see if this resource is being created
   * @returns true if the resource is currently being created
   *
   * @example
   * ```typescript
   * resource.read().then(() => {
   *   // Logs "false"
   *   console.log(resource.isCreating())
   * });
   * // Logs "true"
   * console.log(resource.isCreating());
   * ```
   */
  isCreating(): boolean {
    return this.requester.isCreating();
  }

  /**
   * Checks to see if this resource is being read
   * @returns true if the resource is currently being read
   *
   * @example
   * ```typescript
   * resource.read().then(() => {
   *   // Logs "false"
   *   console.log(resource.isReading())
   * });
   * // Logs "true"
   * console.log(resource.isReading());
   * ```
   */
  isReading(): boolean {
    return this.requester.isReading();
  }

  /**
   * Checks to see if this resource is being deleted
   * @returns true if the resource is currently being deleted
   *
   * @example
   * ```typescript
   * resource.read().then(() => {
   *   // Logs "false"
   *   console.log(resource.isDeleting())
   * });
   * // Logs "true"
   * console.log(resource.isDeleting());
   * ```
   */
  isDeleting(): boolean {
    return this.requester.isDeletinng();
  }

  /**
   * Checks to see if this resource is being read for the first time
   * @returns true if the resource is currently being read for the first time
   *
   * @example
   * ```typescript
   * resource.read().then(() => {
   *   // Logs "false"
   *   console.log(resource.isDoingInitialFetch())
   * });
   * // Logs "true"
   * console.log(resource.isDoingInitialFetch());
   * ```
   */
  isDoingInitialFetch(): boolean {
    return this.isReading() && !this.isFetched();
  }

  /**
   * Checks to see if this resource is being read for a subsequent time
   * @returns true if the resource is currently being read for a subsequent time
   *
   * @example
   * ```typescript
   * await resource.read();
   * resource.read().then(() => {
   *   // Logs "false"
   *   console.log(resource.isCreating())
   * });
   * // Logs "true"
   * console.log(resource.isCreating());
   * ```
   */
  isReloading(): boolean {
    return this.isReading() && this.isFetched();
  }

  /**
   * ===========================================================================
   * CHECKERS
   * ===========================================================================
   */

  /**
   * Check to see if this resource has been fetched
   * @returns true if this resource has been fetched before
   *
   * @example
   * ```typescript
   * // Logs "false"
   * console.log(resource.isFetched());
   * const result = await resource.read();
   * if (!result.isError) {
   *   // Logs "true"
   *   console.log(resource.isFetched());
   * }
   * ```
   */
  isFetched(): boolean {
    return this.didInitialFetch;
  }

  /**
   * Check to see if this resource is currently unfetched
   * @returns true if the resource is currently unfetched
   *
   * @example
   * ```typescript
   * // Logs "true"
   * console.log(resource.isUnetched());
   * const result = await resource.read();
   * if (!result.isError) {
   *   // Logs "false"
   *   console.log(resource.isUnfetched());
   * }
   * ```
   */
  isUnfetched(): boolean {
    return !this.didInitialFetch;
  }

  /**
   * Is this resource currently absent (it does not exist)
   * @returns true if the resource is absent, false if not, undefined if unknown
   *
   * @example
   * ```typescript
   * // Logs "undefined"
   * console.log(resource.isAbsent());
   * const result = resource.read();
   * if (!result.isError) {
   *   // False if the resource exists, true if it does not
   *   console.log(resource.isAbsent());
   * }
   * ```
   */
  isAbsent(): boolean | undefined {
    return this.absent;
  }

  /**
   * Is this resource currently present on the Pod
   * @returns false if the resource is absent, true if not, undefined if unknown
   *
   * @example
   * ```typescript
   * // Logs "undefined"
   * console.log(resource.isPresent());
   * const result = resource.read();
   * if (!result.isError) {
   *   // True if the resource exists, false if it does not
   *   console.log(resource.isPresent());
   * }
   * ```
   */
  isPresent(): boolean | undefined {
    return this.absent === undefined ? undefined : !this.absent;
  }

  /**
   * ===========================================================================
   * HELPER METHODS
   * ===========================================================================
   */

  /**
   * @internal
   * Emits an update event for both this resource and the parent
   */
  protected emitThisAndParent() {
    this.emit("update");
    const parentUri = getParentUri(this.uri);
    if (parentUri) {
      const parentContainer = this.context.resourceStore.get(parentUri);
      parentContainer.emit("update");
    }
  }

  /**
   * ===========================================================================
   * READ METHODS
   * ===========================================================================
   */

  /**
   * @internal
   * A helper method updates this resource's internal state upon read success
   * @param result - the result of the read success
   */
  protected updateWithReadSuccess(result: ReadSuccess) {
    this.absent = result.type === "absentReadSuccess";
    this.didInitialFetch = true;
  }

  /**
   * @internal
   * A helper method that handles the core functions for reading
   * @returns ReadResult
   */
  protected async handleRead(): Promise<ReadContainerResult | ReadLeafResult> {
    const result = await this.requester.read();
    this.status = result;
    if (result.isError) return result;
    this.updateWithReadSuccess(result);
    this.emitThisAndParent();
    return result;
  }

  /**
   * @internal
   * Converts the current state of this resource to a readResult
   * @returns a ReadResult
   */
  protected abstract toReadResult(): ResourceResult<
    ReadLeafResult | ReadContainerResult,
    Container | Leaf
  >;

  /**
   * Reads the resource
   */
  abstract read(): Promise<
    ResourceResult<ReadLeafResult | ReadContainerResult, Container | Leaf>
  >;

  /**
   * Reads the resource if it isn't fetched yet
   * @returns a ReadResult
   */
  async readIfUnfetched(): Promise<
    ResourceResult<ReadLeafResult | ReadContainerResult, Container | Leaf>
  > {
    if (this.didInitialFetch) {
      const readResult = this.toReadResult();
      this.status = readResult;
      return readResult;
    }
    return this.read();
  }

  /**
   * ===========================================================================
   * DELETE METHODS
   * ===========================================================================
   */

  /**
   * @internal
   * A helper method updates this resource's internal state upon delete success
   * @param result - the result of the delete success
   */
  protected updateWithDeleteSuccess(_result: DeleteSuccess) {
    this.absent = true;
    this.didInitialFetch = true;
  }

  /**
   * @internal
   * Helper method that handles the core functions for deleting a resource
   * @returns DeleteResult
   */
  protected async handleDelete(): Promise<DeleteResult> {
    const result = await this.requester.delete();
    this.status = result;
    if (result.isError) return result;
    this.updateWithDeleteSuccess(result);
    this.emitThisAndParent();
    return result;
  }

  /**
   * ===========================================================================
   * CREATE METHODS
   * ===========================================================================
   */

  /**
   * A helper method updates this resource's internal state upon create success
   * @param _result - the result of the create success
   */
  protected updateWithCreateSuccess(result: ResourceSuccess) {
    this.absent = false;
    this.didInitialFetch = true;
    if (isReadSuccess(result)) {
      this.updateWithReadSuccess(result);
    }
  }

  /**
   * Creates a resource at this URI and overwrites any that already exists
   * @returns CreateAndOverwriteResult
   *
   * @example
   * ```typescript
   * const result = await resource.createAndOverwrite();
   * if (!result.isError) {
   *   // Do something
   * }
   * ```
   */
  abstract createAndOverwrite(): Promise<
    ResourceResult<
      ContainerCreateAndOverwriteResult | LeafCreateAndOverwriteResult,
      Leaf | Container
    >
  >;

  /**
   * @internal
   * Helper method that handles the core functions for creating and overwriting
   * a resource
   * @returns DeleteResult
   */
  protected async handleCreateAndOverwrite(): Promise<
    ContainerCreateAndOverwriteResult | LeafCreateAndOverwriteResult
  > {
    const result = await this.requester.createDataResource(true);
    this.status = result;
    if (result.isError) return result;
    this.updateWithCreateSuccess(result);
    this.emitThisAndParent();
    return result;
  }

  /**
   * Creates a resource at this URI if the resource doesn't already exist
   * @returns CreateIfAbsentResult
   *
   * @example
   * ```typescript
   * const result = await leaf.createIfAbsent();
   * if (!result.isError) {
   *   // Do something
   * }
   * ```
   */
  abstract createIfAbsent(): Promise<
    ResourceResult<
      ContainerCreateIfAbsentResult | LeafCreateIfAbsentResult,
      Leaf | Container
    >
  >;

  /**
   * @internal
   * Helper method that handles the core functions for creating a resource if
   *  absent
   * @returns DeleteResult
   */
  protected async handleCreateIfAbsent(): Promise<
    ContainerCreateIfAbsentResult | LeafCreateIfAbsentResult
  > {
    const result = await this.requester.createDataResource();
    this.status = result;
    if (result.isError) return result;
    this.updateWithCreateSuccess(result);
    this.emitThisAndParent();
    return result;
  }

  /**
   * ===========================================================================
   * PARENT CONTAINER METHODS
   * ===========================================================================
   */

  /**
   * Gets the root container for this resource.
   * @returns The root container for this resource
   *
   * @example
   * Suppose the root container is at `https://example.com/`
   *
   * ```typescript
   * const resource = ldoSolidDataset
   *   .getResource("https://example.com/container/resource.ttl");
   * const rootContainer = await resource.getRootContainer();
   * if (!rootContainer.isError) {
   *   // logs "https://example.com/"
   *   console.log(rootContainer.uri);
   * }
   * ```
   */
  abstract getRootContainer(): Promise<
    Container | CheckRootResultError | NoRootContainerError
  >;

  abstract getParentContainer(): Promise<
    Container | CheckRootResultError | undefined
  >;

  /**
   * ===========================================================================
   * WEB ACCESS CONTROL METHODS
   * ===========================================================================
   */

  /**
   * Retrieves the URI for the web access control (WAC) rules for this resource
   * @param options - set the "ignoreCache" field to true to ignore any cached
   * information on WAC rules.
   * @returns WAC Rules results
   */
  protected async getWacUri(options?: {
    ignoreCache: boolean;
  }): Promise<GetWacUriResult> {
    // Get the wacUri if not already present
    if (!options?.ignoreCache && this.wacUri) {
      return {
        type: "getWacUriSuccess",
        wacUri: this.wacUri,
        isError: false,
        uri: this.uri,
      };
    }

    const wacUriResult = await getWacUri(this.uri, {
      fetch: this.context.fetch,
    });
    if (wacUriResult.isError) {
      return wacUriResult;
    }
    this.wacUri = wacUriResult.wacUri;
    return wacUriResult;
  }

  /**
   * Retrieves web access control (WAC) rules for this resource
   * @param options - set the "ignoreCache" field to true to ignore any cached
   * information on WAC rules.
   * @returns WAC Rules results
   *
   * @example
   * ```typescript
   * const resource = ldoSolidDataset
   *   .getResource("https://example.com/container/resource.ttl");
   * const wacRulesResult = await resource.getWac();
   * if (!wacRulesResult.isError) {
   *   const wacRules = wacRulesResult.wacRule;
   *   // True if the resource is publicly readable
   *   console.log(wacRules.public.read);
   *   // True if authenticated agents can write to the resource
   *   console.log(wacRules.authenticated.write);
   *   // True if the given WebId has append access
   *   console.log(
   *     wacRules.agent[https://example.com/person1/profile/card#me].append
   *   );
   *   // True if the given WebId has control access
   *   console.log(
   *     wacRules.agent[https://example.com/person1/profile/card#me].control
   *   );
   * }
   * ```
   */
  async getWac(options?: {
    ignoreCache: boolean;
  }): Promise<GetWacUriError | GetWacRuleResult> {
    // Return the wac rule if it's already cached
    if (!options?.ignoreCache && this.wacRule) {
      return {
        type: "getWacRuleSuccess",
        uri: this.uri,
        isError: false,
        wacRule: this.wacRule,
      };
    }

    // Get the wac uri
    const wacUriResult = await this.getWacUri(options);
    if (wacUriResult.isError) return wacUriResult;

    // Get the wac rule
    const wacResult = await getWacRuleWithAclUri(wacUriResult.wacUri, {
      fetch: this.context.fetch,
    });
    if (wacResult.isError) return wacResult;
    // If the wac rules was successfully found
    if (wacResult.type === "getWacRuleSuccess") {
      this.wacRule = wacResult.wacRule;
      return wacResult;
    }

    // If the WacRule is absent
    const parentResource = await this.getParentContainer();
    if (parentResource?.isError) return parentResource;
    if (!parentResource) {
      return new NoncompliantPodError(
        this.uri,
        `Resource "${this.uri}" has no Effective ACL resource`,
      );
    }
    return parentResource.getWac();
  }

  /**
   * Sets access rules for a specific resource
   * @param wacRule - the access rules to set
   * @returns SetWacRuleResult
   *
   * @example
   * ```typescript
   * const resource = ldoSolidDataset
   *   .getResource("https://example.com/container/resource.ttl");
   * const wacRulesResult = await resource.setWac({
   *   public: {
   *     read: true,
   *     write: false,
   *     append: false,
   *     control: false
   *   },
   *   authenticated: {
   *     read: true,
   *     write: false,
   *     append: true,
   *     control: false
   *   },
   *   agent: {
   *     "https://example.com/person1/profile/card#me": {
   *       read: true,
   *       write: true,
   *       append: true,
   *       control: true
   *     }
   *   }
   * });
   * ```
   */
  async setWac(wacRule: WacRule): Promise<GetWacUriError | SetWacRuleResult> {
    const wacUriResult = await this.getWacUri();
    if (wacUriResult.isError) return wacUriResult;

    const result = await setWacRuleForAclUri(
      wacUriResult.wacUri,
      wacRule,
      this.uri,
      {
        fetch: this.context.fetch,
      },
    );
    if (result.isError) return result;
    this.wacRule = result.wacRule;
    return result;
  }
}
