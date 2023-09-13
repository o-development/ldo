import type { LeafUri } from "../util/uriTypes";
import { RequestBatcher } from "../util/RequestBatcher";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import type { DatasetChanges } from "@ldo/rdf-utils";
import type {
  CreateResult,
  CreateResultWithoutOverwrite,
} from "./requests/createDataResource";
import { createDataResource } from "./requests/createDataResource";
import type { ReadResult } from "./requests/readResource";
import { readResource } from "./requests/readResource";
import type {
  UploadResult,
  UploadResultWithoutOverwrite,
} from "./requests/uploadResource";
import { uploadResource } from "./requests/uploadResource";
import type { DeleteResult } from "./requests/deleteResource";
import { deleteResource } from "./requests/deleteResource";
import type { UpdateResult } from "./requests/updateDataResource";

export class LeafRequester {
  private requestBatcher = new RequestBatcher();

  // All intance variables
  readonly uri: LeafUri;
  private context: SolidLdoDatasetContext;

  constructor(uri: LeafUri, context: SolidLdoDatasetContext) {
    this.uri = uri;
    this.context = context;
  }

  /**
   * Read this resource.
   */
  async read(): Promise<ReadResult> {
    const READ_KEY = "read";
    const transaction = this.context.solidLdoDataset.startTransaction();
    const result = await this.requestBatcher.queueProcess({
      name: READ_KEY,
      args: [{ uri: this.uri, transaction, fetch: this.context.fetch }],
      perform: readResource,
      modifyQueue: (queue, isLoading) => {
        if (queue.length === 0) {
          return isLoading[READ_KEY];
        } else {
          return queue[queue.length - 1].name === READ_KEY;
        }
      },
    });
    if (result.type !== "error") {
      transaction.commit();
    }
    return result;
  }

  /**
   * Creates a Resource
   * @param overwrite: If true, this will orverwrite the resource if it already
   * exists
   */
  async createDataResource(
    overwrite?: false,
  ): Promise<CreateResultWithoutOverwrite>;
  async createDataResource(overwrite: true): Promise<CreateResult>;
  async createDataResource(
    overwrite?: boolean,
  ): Promise<CreateResultWithoutOverwrite | CreateResult>;
  async createDataResource(
    overwrite?: boolean,
  ): Promise<CreateResultWithoutOverwrite> {
    const CREATE_KEY = "createDataResource";
    const transaction = this.context.solidLdoDataset.startTransaction();
    const result = await this.requestBatcher.queueProcess({
      name: CREATE_KEY,
      args: [
        { uri: this.uri, transaction, fetch: this.context.fetch },
        overwrite,
      ],
      perform: createDataResource,
      modifyQueue: (queue, isLoading, args) => {
        const lastElementInQueue = queue[queue.length - 1];
        return (
          lastElementInQueue &&
          lastElementInQueue.name === CREATE_KEY &&
          !!lastElementInQueue.args[1] === !!args[1]
        );
      },
    });
    if (result.type !== "error") {
      transaction.commit();
    }
    return result;
  }

  /**
   * Upload a binary
   * @param blob
   * @param mimeType
   * @param overwrite: If true, will overwrite an existing file
   */
  async upload(
    blob: Blob,
    mimeType: string,
    overwrite?: false,
  ): Promise<UploadResultWithoutOverwrite>;
  async upload(
    blob: Blob,
    mimeType: string,
    overwrite: true,
  ): Promise<UploadResult>;
  async upload(
    blob: Blob,
    mimeType: string,
    overwrite?: boolean,
  ): Promise<UploadResultWithoutOverwrite | UploadResult>;
  async upload(
    blob: Blob,
    mimeType: string,
    overwrite?: boolean,
  ): Promise<UploadResultWithoutOverwrite | UploadResult> {
    const UPLOAD_KEY = "upload";
    const transaction = this.context.solidLdoDataset.startTransaction();
    const result = await this.requestBatcher.queueProcess({
      name: UPLOAD_KEY,
      args: [
        { uri: this.uri, transaction, fetch: this.context.fetch },
        blob,
        mimeType,
        overwrite,
      ],
      perform: uploadResource,
      modifyQueue: (queue, isLoading, args) => {
        const lastElementInQueue = queue[queue.length - 1];
        return (
          lastElementInQueue &&
          lastElementInQueue.name === UPLOAD_KEY &&
          !!lastElementInQueue.args[3] === !!args[3]
        );
      },
    });
    if (result.type !== "error") {
      transaction.commit();
    }
    return result;
  }

  /**
   * Update the data on this resource
   * @param changes
   */
  updateDataResource(_changes: DatasetChanges): Promise<UpdateResult> {
    throw new Error("Not Implemented");
  }

  /**
   * Delete this resource
   */
  async delete(): Promise<DeleteResult> {
    const DELETE_KEY = "delete";
    const transaction = this.context.solidLdoDataset.startTransaction();
    const result = await this.requestBatcher.queueProcess({
      name: DELETE_KEY,
      args: [{ uri: this.uri, transaction, fetch: this.context.fetch }],
      perform: deleteResource,
      modifyQueue: (queue, isLoading) => {
        if (queue.length === 0) {
          return isLoading[DELETE_KEY];
        } else {
          return queue[queue.length - 1].name === DELETE_KEY;
        }
      },
    });
    if (result.type !== "error") {
      transaction.commit();
    }
    return result;
  }
}
