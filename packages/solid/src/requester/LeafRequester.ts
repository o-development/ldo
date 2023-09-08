import type { LeafUri } from "../uriTypes";
import { RequestBatcher } from "../util/RequestBatcher";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import { AbsentResult } from "./requesterResults/AbsentResult";
import {
  DataResult,
  TurtleFormattingError,
} from "./requesterResults/DataResult";
import { BinaryResult } from "./requesterResults/BinaryResult";
import {
  HttpErrorResult,
  ServerHttpError,
  UnauthenticatedHttpError,
  UnexpectedHttpError,
} from "./requesterResults/HttpErrorResult";
import { UnexpectedError } from "./requesterResults/ErrorResult";
import { parseRdf } from "@ldo/ldo";
import { namedNode } from "@rdfjs/data-model";

export type ReadResult =
  | AbsentResult
  | DataResult
  | BinaryResult
  | ServerHttpError
  | UnauthenticatedHttpError
  | UnexpectedHttpError
  | UnexpectedError
  | TurtleFormattingError;

export class LeafRequester {
  private requestBatcher = new RequestBatcher();

  // All intance variables
  readonly uri: LeafUri;
  private context: SolidLdoDatasetContext;

  constructor(uri: LeafUri, context: SolidLdoDatasetContext) {
    this.uri = uri;
    this.context = context;
  }

  // Read Methods
  read(): Promise<ReadResult> {
    const READ_KEY = "read";
    return this.requestBatcher.queueProcess({
      name: READ_KEY,
      args: [],
      perform: this.performRead.bind(this),
      modifyQueue: (queue, isLoading) => {
        if (queue.length === 0) {
          return isLoading[READ_KEY];
        } else {
          return queue[queue.length - 1].name === READ_KEY;
        }
      },
    });
  }

  private async performRead(): Promise<ReadResult> {
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

      if (DataResult.is(response)) {
        // Parse Turtle
        const rawTurtle = await response.text();
        let loadedDataset;
        try {
          loadedDataset = await parseRdf(rawTurtle, {
            baseIRI: this.uri,
          });
        } catch (err) {
          return new TurtleFormattingError(
            this.uri,
            err instanceof Error ? err.message : "Failed to parse rdf",
          );
        }

        // Start transaction
        const transactionalDataset =
          this.context.solidLdoDataset.startTransaction();
        const graphNode = namedNode(this.uri);
        // Destroy all triples that were once a part of this resouce
        loadedDataset.deleteMatches(undefined, undefined, undefined, graphNode);
        // Add the triples from the fetched item
        transactionalDataset.addAll(loadedDataset);
        transactionalDataset.commit();
        return new DataResult(this.uri);
      } else {
        // Load Blob
        const blob = await response.blob();
        return new BinaryResult(this.uri, blob);
      }
    } catch (err) {
      return UnexpectedError.fromThrown(this.uri, err);
    }
  }

  // // Create Methods
  // abstract createDataResource(overwrite?: boolean): Promise<DataLeaf | ResourceError>;

  // abstract upload(
  //   blob: Blob,
  //   mimeType: string,
  //   overwrite?: boolean,
  // ): Promise<BinaryLeaf | ResourceError>;

  // abstract updateData(
  //   changes: DatasetChanges,
  // ): Promise<DataLeaf | ResourceError>;

  // abstract delete(): Promise<AbsentLeaf | ResourceError>;
}
