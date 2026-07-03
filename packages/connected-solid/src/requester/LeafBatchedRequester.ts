import type { DatasetChanges } from "@ldo/rdf-utils";
import { mergeDatasetChanges } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";
import { BatchedRequester } from "./BatchedRequester";
import type {
  LeafCreateAndOverwriteResult,
  LeafCreateIfAbsentResult,
} from "./requests/createDataResource";
import type { ReadLeafResult } from "./requests/readResource";
import type { UpdateResult } from "./requests/updateDataResource";
import { updateDataResource } from "./requests/updateDataResource";
import { uploadResource } from "./requests/uploadResource";
import type { SolidLeaf } from "../resources/SolidLeaf";
import type { ConnectedContext, ResourceCapability } from "@ldo/connected";
import type { SolidConnectedPlugin } from "../SolidConnectedPlugin";

export const UPDATE_KEY = "update";
export const UPLOAD_KEY = "upload";

/**
 * @internal
 *
 *  A singleton to handle batched requests for leafs
 */
export class LeafBatchedRequester<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Capabilities extends ResourceCapability<string, any>[],
> extends BatchedRequester<Capabilities, SolidLeaf<Capabilities>> {
  /**
   * The URI of the leaf
   */
  readonly resource: SolidLeaf<Capabilities>;

  /**
   * @param uri - the URI of the leaf
   * @param context - SolidLdoDatasetContext of the parent dataset
   */
  constructor(
    resource: SolidLeaf<Capabilities>,
    context: ConnectedContext<SolidConnectedPlugin<Capabilities>[]>,
  ) {
    super(context);
    this.resource = resource;
  }

  /**
   * Checks if the resource is currently executing an update request
   * @returns true if the resource is currently executing an update request
   */
  isUpdating(): boolean {
    return this.requestBatcher.isLoading(UPDATE_KEY);
  }

  /**
   * Checks if the resource is currently executing an upload request
   * @returns true if the resource is currently executing an upload request
   */
  isUploading(): boolean {
    return this.requestBatcher.isLoading(UPLOAD_KEY);
  }

  /**
   * Reads the leaf
   * @returns A ReadLeafResult
   */
  async read(): Promise<ReadLeafResult> {
    return super.read() as Promise<ReadLeafResult>;
  }

  /**
   * Creates the leaf as a data resource
   * @param overwrite - If true, this will orverwrite the resource if it already
   * exists
   */
  createDataResource(
    overwrite: true,
  ): Promise<LeafCreateAndOverwriteResult<Capabilities>>;
  createDataResource(
    overwrite?: false,
  ): Promise<LeafCreateIfAbsentResult<Capabilities>>;
  createDataResource(
    overwrite?: boolean,
  ): Promise<
    | LeafCreateIfAbsentResult<Capabilities>
    | LeafCreateAndOverwriteResult<Capabilities>
  >;
  createDataResource(
    overwrite?: boolean,
  ): Promise<
    | LeafCreateIfAbsentResult<Capabilities>
    | LeafCreateAndOverwriteResult<Capabilities>
  > {
    return super.createDataResource(overwrite) as Promise<
      | LeafCreateIfAbsentResult<Capabilities>
      | LeafCreateAndOverwriteResult<Capabilities>
    >;
  }

  /**
   * Update the data on this resource
   * @param changes - DatasetChanges that should be applied to the Pod
   */
  async updateDataResource(
    changes: DatasetChanges<Quad>,
  ): Promise<UpdateResult<SolidLeaf<Capabilities>>> {
    const result = await this.requestBatcher.queueProcess({
      name: UPDATE_KEY,
      args: [
        this.resource,
        changes,
        {
          fetch: this.context.solid.fetch,
          dataset: this.context.dataset,
        },
      ],
      perform: updateDataResource,
      modifyQueue: (queue, currentlyProcessing, [, changes]) => {
        if (queue[queue.length - 1]?.name === UPDATE_KEY) {
          // Merge Changes
          const originalChanges = queue[queue.length - 1].args[1];
          mergeDatasetChanges(originalChanges, changes);
          return queue[queue.length - 1];
        }
        return undefined;
      },
    });
    return result as UpdateResult<SolidLeaf<Capabilities>>;
  }

  /**
   * Upload a binary at this resource's URI
   * @param blob - A binary blob
   * @param mimeType - the mime type of the blob
   * @param overwrite: If true, will overwrite an existing file
   */
  upload(
    blob: Blob,
    mimeType: string,
    overwrite: true,
  ): Promise<LeafCreateAndOverwriteResult<Capabilities>>;
  upload(
    blob: Blob,
    mimeType: string,
    overwrite?: false,
  ): Promise<LeafCreateIfAbsentResult<Capabilities>>;
  upload(
    blob: Blob,
    mimeType: string,
    overwrite?: boolean,
  ): Promise<
    | LeafCreateAndOverwriteResult<Capabilities>
    | LeafCreateIfAbsentResult<Capabilities>
  >;
  async upload(
    blob: Blob,
    mimeType: string,
    overwrite?: boolean,
  ): Promise<
    | LeafCreateAndOverwriteResult<Capabilities>
    | LeafCreateIfAbsentResult<Capabilities>
  > {
    const transaction = this.context.dataset.startTransaction();
    const result = await this.requestBatcher.queueProcess({
      name: UPLOAD_KEY,
      args: [
        this.resource,
        blob,
        mimeType,
        // Hack: Something's up with these types. I can't be bothered to fix it
        overwrite as false,
        { dataset: transaction, fetch: this.context.solid.fetch },
      ],
      perform: uploadResource,
      modifyQueue: (queue, currentlyLoading, args) => {
        const lastElementInQueue = queue[queue.length - 1];
        if (
          lastElementInQueue &&
          lastElementInQueue.name === UPLOAD_KEY &&
          !!lastElementInQueue.args[3] === !!args[3]
        ) {
          return lastElementInQueue;
        }
        if (
          currentlyLoading &&
          currentlyLoading.name === UPLOAD_KEY &&
          !!currentlyLoading.args[3] === !!args[3]
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any;
  }
}
