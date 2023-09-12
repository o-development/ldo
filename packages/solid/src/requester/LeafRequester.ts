import type { LeafUri } from "../util/uriTypes";
import { RequestBatcher } from "../util/RequestBatcher";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import { AbsentResult } from "./requesterResults/AbsentResult";
import type { TurtleFormattingError } from "./requesterResults/DataResult";
import { DataResult } from "./requesterResults/DataResult";
import { BinaryResult } from "./requesterResults/BinaryResult";
import {
  HttpErrorResult,
  ServerHttpError,
  UnauthenticatedHttpError,
  UnexpectedHttpError,
} from "./requesterResults/HttpErrorResult";
import { UnexpectedError } from "./requesterResults/ErrorResult";
import type { LdoDataset } from "@ldo/ldo";
import { parseRdf } from "@ldo/ldo";
import { namedNode, quad as createQuad } from "@rdfjs/data-model";
import {
  addRawTurtleToDataset,
  addResourceRdfToContainer,
  deleteResourceRdfFromContainer,
  getParentUri,
  getSlug,
} from "../util/rdfUtils";
import type { TransactionalDataset } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";

export type ReadResult =
  | AbsentResult
  | DataResult
  | BinaryResult
  | ServerHttpError
  | UnauthenticatedHttpError
  | UnexpectedHttpError
  | UnexpectedError
  | TurtleFormattingError;

export type CreateResult =
  | DataResult
  | BinaryResult
  | ServerHttpError
  | UnauthenticatedHttpError
  | UnexpectedError
  | UnexpectedHttpError;
export type CreateResultWithoutOverwrite = CreateResult | TurtleFormattingError;

export type DeleteResult =
  | AbsentResult
  | ServerHttpError
  | UnauthenticatedHttpError
  | UnexpectedError
  | UnexpectedHttpError;

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
      args: [transaction],
      perform: (transaction: TransactionalDataset<Quad>) =>
        this.performRead(transaction),
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
   * Helper method to perform the read action
   */
  private async performRead(
    transaction: TransactionalDataset<Quad>,
  ): Promise<ReadResult> {
    try {
      // Fetch options to determine the document type
      const response = await this.context.fetch(this.uri);
      if (AbsentResult.is(response)) {
        return new AbsentResult(this.uri);
      }
      if (ServerHttpError.is(response)) {
        return new ServerHttpError(this.uri, response);
      }
      if (UnauthenticatedHttpError.is(response)) {
        return new UnauthenticatedHttpError(this.uri, response);
      }
      if (HttpErrorResult.isnt(response)) {
        return new UnexpectedHttpError(this.uri, response);
      }

      // Add this resource to the container
      addResourceRdfToContainer(this.uri, transaction);

      if (DataResult.is(response)) {
        // Parse Turtle
        const rawTurtle = await response.text();
        return addRawTurtleToDataset(rawTurtle, transaction, this.uri);
      } else {
        // Load Blob
        const blob = await response.blob();
        return new BinaryResult(this.uri, blob);
      }
    } catch (err) {
      return UnexpectedError.fromThrown(this.uri, err);
    }
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
      args: [transaction, overwrite],
      perform: (transaction: TransactionalDataset<Quad>, overwrite?: boolean) =>
        this.performCreateDataResource(transaction, overwrite),
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
   * Helper Method to perform the createDataResourceAction
   * @param overwrite
   */
  private async performCreateDataResource(
    transaction: TransactionalDataset<Quad>,
    overwrite?: false,
  ): Promise<CreateResultWithoutOverwrite>;
  private async performCreateDataResource(
    transaction: TransactionalDataset<Quad>,
    overwrite: true,
  ): Promise<CreateResult>;
  private async performCreateDataResource(
    transaction: TransactionalDataset<Quad>,
    overwrite?: boolean,
  ): Promise<CreateResultWithoutOverwrite | CreateResult>;
  private async performCreateDataResource(
    transaction: TransactionalDataset<Quad>,
    overwrite?: boolean,
  ): Promise<CreateResultWithoutOverwrite> {
    try {
      if (overwrite) {
        const deleteResult = await this.performDelete(transaction);
        // Return if it wasn't deleted
        if (deleteResult.type !== "absent") {
          return deleteResult;
        }
      } else {
        // Perform a read to check if it exists
        const readResult = await this.performRead(transaction);
        // If it does exist stop and return.
        if (readResult.type !== "absent") {
          return readResult;
        }
      }
      // Create the document
      const parentUri = getParentUri(this.uri)!;
      const response = await this.context.fetch(parentUri, {
        method: "post",
        headers: {
          "content-type": "text/turtle",
          slug: getSlug(this.uri),
        },
      });

      if (ServerHttpError.is(response)) {
        return new ServerHttpError(this.uri, response);
      }
      if (UnauthenticatedHttpError.is(response)) {
        return new UnauthenticatedHttpError(this.uri, response);
      }
      if (HttpErrorResult.isnt(response)) {
        return new UnexpectedHttpError(this.uri, response);
      }
      addResourceRdfToContainer(this.uri, transaction);
      return new DataResult(this.uri);
    } catch (err) {
      return UnexpectedError.fromThrown(this.uri, err);
    }
  }

  // abstract upload(
  //   blob: Blob,
  //   mimeType: string,
  //   overwrite?: boolean,
  // ): Promise<BinaryLeaf | ResourceError>;

  // abstract updateData(
  //   changes: DatasetChanges,
  // ): Promise<DataLeaf | ResourceError>;

  /**
   * Delete this resource
   */
  async delete(): Promise<DeleteResult> {
    const DELETE_KEY = "delete";
    const transaction = this.context.solidLdoDataset.startTransaction();
    const result = await this.requestBatcher.queueProcess({
      name: DELETE_KEY,
      args: [transaction],
      perform: (transaction: TransactionalDataset<Quad>) =>
        this.performDelete(transaction),
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

  /**
   * Helper method to perform this delete action
   */
  private async performDelete(
    transaction: TransactionalDataset<Quad>,
  ): Promise<DeleteResult> {
    try {
      const response = await this.context.fetch(this.uri, {
        method: "delete",
      });

      if (ServerHttpError.is(response)) {
        return new ServerHttpError(this.uri, response);
      }
      if (UnauthenticatedHttpError.is(response)) {
        return new UnauthenticatedHttpError(this.uri, response);
      }
      // Specifically check for a 205. Annoyingly, the server will return 200 even
      // if it hasn't been deleted when you're unauthenticated. 404 happens when
      // the document never existed
      if (response.status === 205 || response.status === 404) {
        transaction.deleteMatches(
          undefined,
          undefined,
          undefined,
          namedNode(this.uri),
        );
        deleteResourceRdfFromContainer(this.uri, transaction);
        return new AbsentResult(this.uri);
      }
      return new UnexpectedHttpError(this.uri, response);
    } catch (err) {
      return UnexpectedError.fromThrown(this.uri, err);
    }
  }
}
