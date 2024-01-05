import { ANY_KEY, RequestBatcher } from "../util/RequestBatcher";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import type {
  ContainerCreateAndOverwriteResult,
  ContainerCreateIfAbsentResult,
  LeafCreateAndOverwriteResult,
  LeafCreateIfAbsentResult,
} from "./requests/createDataResource";
import { createDataResource } from "./requests/createDataResource";
import type {
  ReadContainerResult,
  ReadLeafResult,
} from "./requests/readResource";
import { readResource } from "./requests/readResource";
import type { DeleteResult } from "./requests/deleteResource";
import { deleteResource } from "./requests/deleteResource";
import { modifyQueueByMergingEventsWithTheSameKeys } from "./util/modifyQueueFuntions";

const READ_KEY = "read";
const CREATE_KEY = "createDataResource";
const DELETE_KEY = "delete";

/**
 * @internal
 *
 * A singleton for handling batched requests
 */
export abstract class BatchedRequester {
  /**
   * @internal
   * A request batcher to maintain state for ongoing requests
   */
  protected readonly requestBatcher = new RequestBatcher();

  /**
   * The uri of the resource
   */
  abstract readonly uri: string;

  /**
   * @internal
   * SolidLdoDatasetContext for the parent SolidLdoDataset
   */
  protected context: SolidLdoDatasetContext;

  /**
   * @param context - SolidLdoDatasetContext for the parent SolidLdoDataset
   */
  constructor(context: SolidLdoDatasetContext) {
    this.context = context;
  }

  /**
   * Checks if the resource is currently making any request
   * @returns true if the resource is making any requests
   */
  isLoading(): boolean {
    return this.requestBatcher.isLoading(ANY_KEY);
  }

  /**
   * Checks if the resource is currently executing a create request
   * @returns true if the resource is currently executing a create request
   */
  isCreating(): boolean {
    return this.requestBatcher.isLoading(CREATE_KEY);
  }

  /**
   * Checks if the resource is currently executing a read request
   * @returns true if the resource is currently executing a read request
   */
  isReading(): boolean {
    return this.requestBatcher.isLoading(READ_KEY);
  }

  /**
   * Checks if the resource is currently executing a delete request
   * @returns true if the resource is currently executing a delete request
   */
  isDeletinng(): boolean {
    return this.requestBatcher.isLoading(DELETE_KEY);
  }

  /**
   * Read this resource.
   * @returns A ReadLeafResult or a ReadContainerResult depending on the uri of
   * this resource
   */
  async read(): Promise<ReadLeafResult | ReadContainerResult> {
    const transaction = this.context.solidLdoDataset.startTransaction();
    const result = await this.requestBatcher.queueProcess({
      name: READ_KEY,
      args: [this.uri, { dataset: transaction, fetch: this.context.fetch }],
      perform: readResource,
      modifyQueue: modifyQueueByMergingEventsWithTheSameKeys(READ_KEY),
      after: (result) => {
        if (!result.isError) {
          transaction.commit();
        }
      },
    });
    return result;
  }

  /**
   * Delete this resource
   * @returns A DeleteResult
   */
  async delete(): Promise<DeleteResult> {
    const transaction = this.context.solidLdoDataset.startTransaction();
    const result = await this.requestBatcher.queueProcess({
      name: DELETE_KEY,
      args: [this.uri, { dataset: transaction, fetch: this.context.fetch }],
      perform: deleteResource,
      modifyQueue: modifyQueueByMergingEventsWithTheSameKeys(DELETE_KEY),
      after: (result) => {
        if (!result.isError) {
          transaction.commit();
        }
      },
    });
    return result;
  }

  /**
   * Creates a Resource
   * @param overwrite - If true, this will orverwrite the resource if it already
   * exists
   * @returns A ContainerCreateAndOverwriteResult or a
   * LeafCreateAndOverwriteResult depending on this resource's URI
   */
  createDataResource(
    overwrite: true,
  ): Promise<ContainerCreateAndOverwriteResult | LeafCreateAndOverwriteResult>;
  createDataResource(
    overwrite?: false,
  ): Promise<ContainerCreateIfAbsentResult | LeafCreateIfAbsentResult>;
  createDataResource(
    overwrite?: boolean,
  ): Promise<
    | ContainerCreateAndOverwriteResult
    | LeafCreateAndOverwriteResult
    | ContainerCreateIfAbsentResult
    | LeafCreateIfAbsentResult
  >;
  async createDataResource(
    overwrite?: boolean,
  ): Promise<
    | ContainerCreateAndOverwriteResult
    | LeafCreateAndOverwriteResult
    | ContainerCreateIfAbsentResult
    | LeafCreateIfAbsentResult
  > {
    const transaction = this.context.solidLdoDataset.startTransaction();
    const result = await this.requestBatcher.queueProcess({
      name: CREATE_KEY,
      args: [
        this.uri,
        overwrite,
        { dataset: transaction, fetch: this.context.fetch },
      ],
      perform: createDataResource,
      modifyQueue: (queue, currentlyLoading, args) => {
        const lastElementInQueue = queue[queue.length - 1];
        if (
          lastElementInQueue &&
          lastElementInQueue.name === CREATE_KEY &&
          !!lastElementInQueue.args[1] === !!args[1]
        ) {
          return lastElementInQueue;
        }
        if (
          currentlyLoading &&
          currentlyLoading.name === CREATE_KEY &&
          !!currentlyLoading.args[1] === !!args[1]
        ) {
          return currentlyLoading;
        }
        return undefined;
      },
      after: (result) => {
        if (!result.isError) {
          transaction.commit();
        }
      },
    });
    return result;
  }
}
