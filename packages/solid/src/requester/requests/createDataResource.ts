import { guaranteeFetch } from "../../util/guaranteeFetch";
import {
  addResourceRdfToContainer,
  getParentUri,
  getSlug,
} from "../../util/rdfUtils";
import type { ContainerUri, LeafUri } from "../../util/uriTypes";
import { isContainerUri } from "../../util/uriTypes";
import { UnexpectedResourceError } from "../results/error/ErrorResult";
import type { HttpErrorResultType } from "../results/error/HttpErrorResult";
import { HttpErrorResult } from "../results/error/HttpErrorResult";
import type { CreateSuccess } from "../results/success/CreateSuccess";
import type { AbsentReadSuccess } from "../results/success/ReadSuccess";
import type { DeleteResultError } from "./deleteResource";
import { deleteResource } from "./deleteResource";
import type {
  ReadContainerResult,
  ReadLeafResult,
  ReadResultError,
} from "./readResource";
import { readResource } from "./readResource";
import type { DatasetRequestOptions } from "./requestOptions";

export type ContainerCreateAndOverwriteResult =
  | CreateSuccess
  | CreateAndOverwriteResultErrors;
export type LeafCreateAndOverwriteResult =
  | CreateSuccess
  | CreateAndOverwriteResultErrors;
export type ContainerCreateIfAbsentResult =
  | CreateSuccess
  | Exclude<ReadContainerResult, AbsentReadSuccess>
  | CreateIfAbsentResultErrors;
export type LeafCreateIfAbsentResult =
  | CreateSuccess
  | Exclude<ReadLeafResult, AbsentReadSuccess>
  | CreateIfAbsentResultErrors;

export type CreateAndOverwriteResultErrors = DeleteResultError | CreateErrors;
export type CreateIfAbsentResultErrors = ReadResultError | CreateErrors;
export type CreateErrors = HttpErrorResultType | UnexpectedResourceError;

export function createDataResource(
  uri: ContainerUri,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateAndOverwriteResult>;
export function createDataResource(
  uri: LeafUri,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<LeafCreateAndOverwriteResult>;
export function createDataResource(
  uri: ContainerUri,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateIfAbsentResult>;
export function createDataResource(
  uri: LeafUri,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult>;
export function createDataResource(
  uri: ContainerUri,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateIfAbsentResult | ContainerCreateAndOverwriteResult>;
export function createDataResource(
  uri: LeafUri,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult | LeafCreateAndOverwriteResult>;
export function createDataResource(
  uri: string,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateAndOverwriteResult | LeafCreateAndOverwriteResult>;
export function createDataResource(
  uri: string,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult | LeafCreateIfAbsentResult>;
export function createDataResource(
  uri: string,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<
  | ContainerCreateAndOverwriteResult
  | LeafCreateAndOverwriteResult
  | ContainerCreateIfAbsentResult
  | LeafCreateIfAbsentResult
>;
export async function createDataResource(
  uri: string,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<
  | ContainerCreateAndOverwriteResult
  | LeafCreateAndOverwriteResult
  | ContainerCreateIfAbsentResult
  | LeafCreateIfAbsentResult
> {
  try {
    const fetch = guaranteeFetch(options?.fetch);
    if (overwrite) {
      const deleteResult = await deleteResource(uri, options);
      // Return if it wasn't deleted
      if (deleteResult.isError) return deleteResult;
    } else {
      // Perform a read to check if it exists
      const readResult = await readResource(uri, options);

      // If it does exist stop and return.
      if (readResult.type !== "absentReadSuccess") {
        return readResult;
      }
    }
    // Create the document
    const parentUri = getParentUri(uri)!;
    const headers: HeadersInit = {
      "content-type": "text/turtle",
      slug: getSlug(uri),
    };
    if (isContainerUri(uri)) {
      headers.link = '<http://www.w3.org/ns/ldp#Container>; rel="type"';
    }
    const response = await fetch(parentUri, {
      method: "post",
      headers,
    });

    const httpError = HttpErrorResult.checkResponse(uri, response);
    if (httpError) return httpError;

    if (options?.dataset) {
      addResourceRdfToContainer(uri, options.dataset);
    }
    return {
      isError: false,
      type: "createSuccess",
      uri,
      didOverwrite: !!overwrite,
    };
  } catch (err) {
    return UnexpectedResourceError.fromThrown(uri, err);
  }
}
