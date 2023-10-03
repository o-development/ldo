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

const READ_KEY = "read";
const CREATE_KEY = "createDataResource";
const DELETE_KEY = "delete";

export abstract class Requester {
  protected readonly requestBatcher = new RequestBatcher();

  // All intance variables
  abstract readonly uri: string;
  protected context: SolidLdoDatasetContext;

  constructor(context: SolidLdoDatasetContext) {
    this.context = context;
  }

  isLoading(): boolean {
    return this.requestBatcher.isLoading(ANY_KEY);
  }
  isCreating(): boolean {
    return this.requestBatcher.isLoading(CREATE_KEY);
  }
  isReading(): boolean {
    return this.requestBatcher.isLoading(READ_KEY);
  }
  isDeletinng(): boolean {
    return this.requestBatcher.isLoading(DELETE_KEY);
  }

  /**
   * Read this resource.
   */
  async read(): Promise<ReadLeafResult | ReadContainerResult> {
    const transaction = this.context.solidLdoDataset.startTransaction();
    const result = await this.requestBatcher.queueProcess({
      name: READ_KEY,
      args: [this.uri, { dataset: transaction, fetch: this.context.fetch }],
      perform: readResource,
      modifyQueue: (queue, currentlyLoading) => {
        if (queue.length === 0 && currentlyLoading?.name === READ_KEY) {
          return currentlyLoading;
        } else if (queue[queue.length - 1]?.name === READ_KEY) {
          return queue[queue.length - 1];
        }
        return undefined;
      },
    });
    if (!result.isError) {
      transaction.commit();
    }
    return result;
  }

  /**
   * Delete this resource
   */
  async delete(): Promise<DeleteResult> {
    const transaction = this.context.solidLdoDataset.startTransaction();
    const result = await this.requestBatcher.queueProcess({
      name: DELETE_KEY,
      args: [this.uri, { dataset: transaction, fetch: this.context.fetch }],
      perform: deleteResource,
      modifyQueue: (queue, currentlyLoading) => {
        if (queue.length === 0 && currentlyLoading?.name === DELETE_KEY) {
          return currentlyLoading;
        } else if (queue[queue.length - 1]?.name === DELETE_KEY) {
          return queue[queue.length - 1];
        }
        return undefined;
      },
    });
    if (!result.isError) {
      transaction.commit();
    }
    return result;
  }

  /**
   * Creates a Resource
   * @param overwrite: If true, this will orverwrite the resource if it already
   * exists
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
    });
    if (!result.isError) {
      transaction.commit();
    }
    return result;
  }
}
