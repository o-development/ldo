import type { DatasetChanges } from "@ldo/rdf-utils";
import { mergeDatasetChanges } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import type { LeafUri } from "../util/uriTypes";
import { Requester } from "./Requester";
import type {
  LeafCreateAndOverwriteResult,
  LeafCreateIfAbsentResult,
} from "./requests/createDataResource";
import type { ReadLeafResult } from "./requests/readResource";
import type { UpdateResult } from "./requests/updateDataResource";
import { updateDataResource } from "./requests/updateDataResource";
import { uploadResource } from "./requests/uploadResource";

export const UPDATE_KEY = "update";
export const UPLOAD_KEY = "upload";

export class LeafRequester extends Requester {
  readonly uri: LeafUri;

  constructor(uri: LeafUri, context: SolidLdoDatasetContext) {
    super(context);
    this.uri = uri;
  }

  isUpdating(): boolean {
    return this.requestBatcher.isLoading(UPDATE_KEY);
  }

  isUploading(): boolean {
    return this.requestBatcher.isLoading(UPLOAD_KEY);
  }

  async read(): Promise<ReadLeafResult> {
    return super.read() as Promise<ReadLeafResult>;
  }

  createDataResource(overwrite: true): Promise<LeafCreateAndOverwriteResult>;
  createDataResource(overwrite?: false): Promise<LeafCreateIfAbsentResult>;
  createDataResource(
    overwrite?: boolean,
  ): Promise<LeafCreateIfAbsentResult | LeafCreateAndOverwriteResult>;
  createDataResource(
    overwrite?: boolean,
  ): Promise<LeafCreateIfAbsentResult | LeafCreateAndOverwriteResult> {
    return super.createDataResource(overwrite) as Promise<
      LeafCreateIfAbsentResult | LeafCreateAndOverwriteResult
    >;
  }

  /**
   * Update the data on this resource
   * @param changes
   */
  async updateDataResource(
    changes: DatasetChanges<Quad>,
  ): Promise<UpdateResult> {
    const transaction = this.context.solidLdoDataset.startTransaction();
    transaction.addAll(changes.added || []);
    changes.removed?.forEach((quad) => transaction.delete(quad));
    // Commit data optimistically
    transaction.commit();

    const result = await this.requestBatcher.queueProcess({
      name: UPDATE_KEY,
      args: [
        this.uri,
        changes,
        { fetch: this.context.fetch, onRollback: () => transaction.rollback() },
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
    return result;
  }

  /**
   * Upload a binary
   * @param blob
   * @param mimeType
   * @param overwrite: If true, will overwrite an existing file
   */
  upload(
    blob: Blob,
    mimeType: string,
    overwrite: true,
  ): Promise<LeafCreateAndOverwriteResult>;
  upload(
    blob: Blob,
    mimeType: string,
    overwrite?: false,
  ): Promise<LeafCreateIfAbsentResult>;
  upload(
    blob: Blob,
    mimeType: string,
    overwrite?: boolean,
  ): Promise<LeafCreateAndOverwriteResult | LeafCreateIfAbsentResult>;
  async upload(
    blob: Blob,
    mimeType: string,
    overwrite?: boolean,
  ): Promise<LeafCreateAndOverwriteResult | LeafCreateIfAbsentResult> {
    const transaction = this.context.solidLdoDataset.startTransaction();
    const result = await this.requestBatcher.queueProcess({
      name: UPLOAD_KEY,
      args: [
        this.uri,
        blob,
        mimeType,
        overwrite,
        { dataset: transaction, fetch: this.context.fetch },
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
    });
    if (!result.isError) {
      transaction.commit();
    }
    return result;
  }
}
