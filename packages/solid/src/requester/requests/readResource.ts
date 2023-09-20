import type { UnexpectedHttpError } from "../results/error/HttpErrorResult";
import {
  HttpErrorResult,
  type HttpErrorResultType,
} from "../results/error/HttpErrorResult";
import {
  addRawTurtleToDataset,
  addResourceRdfToContainer,
} from "../../util/rdfUtils";
import type { DatasetRequestOptions } from "./requestOptions";
import type { ContainerUri, LeafUri } from "../../util/uriTypes";
import { isContainerUri } from "../../util/uriTypes";
import type { BinaryReadSuccess } from "../results/success/ReadSuccess";
import type {
  ContainerReadSuccess,
  DataReadSuccess,
} from "../results/success/ReadSuccess";
import type { AbsentReadSuccess } from "../results/success/ReadSuccess";
import { NoncompliantPodError } from "../results/error/NoncompliantPodError";
import { guaranteeFetch } from "../../util/guaranteeFetch";
import { UnexpectedResourceError } from "../results/error/ErrorResult";
import { checkHeadersForRootContainer } from "./checkRootContainer";

export type ReadLeafResult =
  | BinaryReadSuccess
  | DataReadSuccess
  | AbsentReadSuccess
  | ReadResultError;
export type ReadContainerResult =
  | ContainerReadSuccess
  | AbsentReadSuccess
  | ReadResultError;
export type ReadResultError =
  | HttpErrorResultType
  | NoncompliantPodError
  | UnexpectedHttpError
  | UnexpectedResourceError;

export async function readResource(
  uri: LeafUri,
  options?: DatasetRequestOptions,
): Promise<ReadLeafResult>;
export async function readResource(
  uri: ContainerUri,
  options?: DatasetRequestOptions,
): Promise<ReadContainerResult>;
export async function readResource(
  uri: string,
  options?: DatasetRequestOptions,
): Promise<ReadLeafResult | ReadContainerResult>;
export async function readResource(
  uri: string,
  options?: DatasetRequestOptions,
): Promise<ReadLeafResult | ReadContainerResult> {
  try {
    const fetch = guaranteeFetch(options?.fetch);
    // Fetch options to determine the document type
    const response = await fetch(uri);
    if (response.status === 404) {
      return {
        isError: false,
        type: "absentReadSuccess",
        uri,
        recalledFromMemory: false,
      };
    }
    const httpErrorResult = HttpErrorResult.checkResponse(uri, response);
    if (httpErrorResult) return httpErrorResult;

    // Add this resource to the container
    if (options?.dataset) {
      addResourceRdfToContainer(uri, options.dataset);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType) {
      return new NoncompliantPodError(
        uri,
        "Resource requests must return a content-type header.",
      );
    }

    if (contentType === "text/turtle") {
      // Parse Turtle
      const rawTurtle = await response.text();
      if (options?.dataset) {
        const result = await addRawTurtleToDataset(
          rawTurtle,
          options.dataset,
          uri,
        );
        if (result) return result;
      }
      if (isContainerUri(uri)) {
        const result = checkHeadersForRootContainer(uri, response.headers);
        if (result.isError) return result;
        return {
          isError: false,
          type: "containerReadSuccess",
          uri,
          recalledFromMemory: false,
          isRootContainer: result.isRootContainer,
        };
      }
      return {
        isError: false,
        type: "dataReadSuccess",
        uri,
        recalledFromMemory: false,
      };
    } else {
      // Load Blob
      const blob = await response.blob();
      return {
        isError: false,
        type: "binaryReadSuccess",
        uri,
        recalledFromMemory: false,
        blob,
        mimeType: contentType,
      };
    }
  } catch (err) {
    return UnexpectedResourceError.fromThrown(uri, err);
  }
}
