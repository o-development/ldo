import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import type { ContainerUri } from "../util/uriTypes";
import { BatchedRequester } from "./BatchedRequester";
import type { CheckRootResult } from "./requests/checkRootContainer";
import { checkRootContainer } from "./requests/checkRootContainer";
import type {
  ContainerCreateAndOverwriteResult,
  ContainerCreateIfAbsentResult,
} from "./requests/createDataResource";
import type { ReadContainerResult } from "./requests/readResource";
import { modifyQueueByMergingEventsWithTheSameKeys } from "./util/modifyQueueFuntions";

export const IS_ROOT_CONTAINER_KEY = "isRootContainer";

/**
 * @internal
 *
 * A singleton to handle batched requests for containers
 */
export class ContainerBatchedRequester extends BatchedRequester {
  /**
   * The URI of the container
   */
  readonly uri: ContainerUri;

  /**
   * @param uri - The URI of the container
   * @param context - SolidLdoDatasetContext of the parent dataset
   */
  constructor(uri: ContainerUri, context: SolidLdoDatasetContext) {
    super(context);
    this.uri = uri;
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
  ): Promise<ContainerCreateAndOverwriteResult>;
  createDataResource(overwrite?: false): Promise<ContainerCreateIfAbsentResult>;
  createDataResource(
    overwrite?: boolean,
  ): Promise<ContainerCreateIfAbsentResult | ContainerCreateAndOverwriteResult>;
  createDataResource(
    overwrite?: boolean,
  ): Promise<
    ContainerCreateIfAbsentResult | ContainerCreateAndOverwriteResult
  > {
    return super.createDataResource(overwrite) as Promise<
      ContainerCreateIfAbsentResult | ContainerCreateAndOverwriteResult
    >;
  }

  /**
   * Checks to see if this container is a root container
   * @returns A CheckRootResult
   */
  async isRootContainer(): Promise<CheckRootResult> {
    return this.requestBatcher.queueProcess({
      name: IS_ROOT_CONTAINER_KEY,
      args: [this.uri as ContainerUri, { fetch: this.context.fetch }],
      perform: checkRootContainer,
      modifyQueue: modifyQueueByMergingEventsWithTheSameKeys(
        IS_ROOT_CONTAINER_KEY,
      ),
    });
  }
}
