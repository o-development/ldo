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

/**
 * All possible return values when creating and overwriting a container
 */
export type ContainerCreateAndOverwriteResult =
  | CreateSuccess
  | CreateAndOverwriteResultErrors;

/**
 * All possible return values when creating and overwriting a leaf
 */
export type LeafCreateAndOverwriteResult =
  | CreateSuccess
  | CreateAndOverwriteResultErrors;

/**
 * All possible return values when creating a container if absent
 */
export type ContainerCreateIfAbsentResult =
  | CreateSuccess
  | Exclude<ReadContainerResult, AbsentReadSuccess>
  | CreateIfAbsentResultErrors;

/**
 * All possible return values when creating a leaf if absent
 */
export type LeafCreateIfAbsentResult =
  | CreateSuccess
  | Exclude<ReadLeafResult, AbsentReadSuccess>
  | CreateIfAbsentResultErrors;

/**
 * All possible errors returned by creating and overwriting a resource
 */
export type CreateAndOverwriteResultErrors = DeleteResultError | CreateErrors;

/**
 * All possible errors returned by creating a resource if absent
 */
export type CreateIfAbsentResultErrors = ReadResultError | CreateErrors;

/**
 * All possible errors returned by creating a resource
 */
export type CreateErrors = HttpErrorResultType | UnexpectedResourceError;

/**
 * Creates a data resource (RDF resource) at the provided URI. This resource
 * could also be a container.
 *
 * @param uri - The URI of the resource
 * @param overwrite - If true, the request will overwrite any previous resource
 * at this URI.
 * @param options - Options to provide a fetch function and a local dataset to
 * update.
 * @returns One of many create results depending on the input
 *
 * @example
 * `createDataResource` can be used to create containers.
 *
 * ```typescript
 * import { createDataResource } from "@ldo/solid";
 * import { fetch } from "@inrupt/solid-client-autn-js";
 *
 * const result = await createDataResource(
 *   "https://example.com/container/",
 *   true,
 *   { fetch },
 * );
 * if (!result.isError) {
 *   // Do something
 * }
 * ```
 *
 * @example
 * `createDataResource` can also create a blank data resource at the provided
 * URI.
 *
 * ```typescript
 * import { createDataResource } from "@ldo/solid";
 * import { fetch } from "@inrupt/solid-client-autn-js";
 *
 * const result = await createDataResource(
 *   "https://example.com/container/someResource.ttl",
 *   true,
 *   { fetch },
 * );
 * if (!result.isError) {
 *   // Do something
 * }
 * ```
 *
 * @example
 * Any local RDFJS dataset passed to the `options` field will be updated with
 * any new RDF data from the create process.
 *
 * ```typescript
 * import { createDataResource } from "@ldo/solid";
 * import { createDataset } from "@ldo/dataset"
 * import { fetch } from "@inrupt/solid-client-autn-js";
 *
 * const localDataset = createDataset();
 * const result = await createDataResource(
 *   "https://example.com/container/someResource.ttl",
 *   true,
 *   { fetch, dataset: localDataset },
 * );
 * if (!result.isError) {
 *   // Do something
 * }
 * ```
 */
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
    let didOverwrite = false;
    if (overwrite) {
      const deleteResult = await deleteResource(uri, options);
      // Return if it wasn't deleted
      if (deleteResult.isError) return deleteResult;
      didOverwrite = deleteResult.resourceExisted;
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
      didOverwrite,
    };
  } catch (err) {
    return UnexpectedResourceError.fromThrown(uri, err);
  }
}
