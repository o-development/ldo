import type { ConnectedContext, ResourceCapability } from "@ldo/connected";
import type { SolidContainer } from "../resources/SolidContainer";
import { BatchedRequester } from "./BatchedRequester";
import type { CheckRootResult } from "./requests/checkRootContainer";
import { checkRootContainer } from "./requests/checkRootContainer";
import type {
  ContainerCreateAndOverwriteResult,
  ContainerCreateIfAbsentResult,
} from "./requests/createDataResource";
import type { ReadContainerResult } from "./requests/readResource";
import { modifyQueueByMergingEventsWithTheSameKeys } from "./util/modifyQueueFuntions";
import type { SolidConnectedPlugin } from "../SolidConnectedPlugin";

export const IS_ROOT_CONTAINER_KEY = "isRootContainer";

/**
 * @internal
 *
 * A singleton to handle batched requests for containers
 */
export class ContainerBatchedRequester<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Capabilities extends ResourceCapability<string, any>[],
> extends BatchedRequester<Capabilities, SolidContainer<Capabilities>> {
  /**
   * The URI of the container
   */
  readonly resource: SolidContainer<Capabilities>;

  /**
   * @param uri - The URI of the container
   * @param context - ConnectedContext of the parent dataset
   */
  constructor(
    resource: SolidContainer<Capabilities>,
    context: ConnectedContext<SolidConnectedPlugin<Capabilities>[]>,
  ) {
    super(context);
    this.resource = resource;
  }

  /**
   * Reads the container
   * @returns A ReadContainerResult
   */
  read(): Promise<ReadContainerResult> {
    return super.read() as Promise<ReadContainerResult>;
  }

  /**
   * Creates the container
   * @param overwrite - If true, this will orverwrite the resource if it already
   * exists
   */
  createDataResource(
    overwrite: true,
  ): Promise<ContainerCreateAndOverwriteResult<Capabilities>>;
  createDataResource(
    overwrite?: false,
  ): Promise<ContainerCreateIfAbsentResult<Capabilities>>;
  createDataResource(
    overwrite?: boolean,
  ): Promise<
    | ContainerCreateIfAbsentResult<Capabilities>
    | ContainerCreateAndOverwriteResult<Capabilities>
  >;
  createDataResource(
    overwrite?: boolean,
  ): Promise<
    | ContainerCreateIfAbsentResult<Capabilities>
    | ContainerCreateAndOverwriteResult<Capabilities>
  > {
    return super.createDataResource(overwrite) as Promise<
      | ContainerCreateIfAbsentResult<Capabilities>
      | ContainerCreateAndOverwriteResult<Capabilities>
    >;
  }

  /**
   * Checks to see if this container is a root container
   * @returns A CheckRootResult
   */
  async isRootContainer(): Promise<CheckRootResult> {
    return this.requestBatcher.queueProcess({
      name: IS_ROOT_CONTAINER_KEY,
      args: [this.resource, { fetch: this.context.solid.fetch }],
      perform: checkRootContainer,
      modifyQueue: modifyQueueByMergingEventsWithTheSameKeys(
        IS_ROOT_CONTAINER_KEY,
      ),
    });
  }
}
