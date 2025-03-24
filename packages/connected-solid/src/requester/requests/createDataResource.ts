/* eslint-disable @typescript-eslint/no-explicit-any */
import { guaranteeFetch } from "../../util/guaranteeFetch";
import {
  addResourceRdfToContainer,
  getParentUri,
  getSlug,
} from "../../util/rdfUtils";
import type { AbsentReadSuccess, Resource } from "@ldo/connected";
import { UnexpectedResourceError } from "@ldo/connected";
import type { HttpErrorResultType } from "../results/error/HttpErrorResult";
import { HttpErrorResult } from "../results/error/HttpErrorResult";
import { CreateSuccess } from "../results/success/CreateSuccess";
import type { DeleteResultError } from "./deleteResource";
import { deleteResource } from "./deleteResource";
import type {
  ReadContainerResult,
  ReadLeafResult,
  ReadResultError,
} from "./readResource";
import { readResource } from "./readResource";
import type { DatasetRequestOptions } from "./requestOptions";
import type { SolidLeaf } from "../../resources/SolidLeaf";
import type { SolidContainer } from "../../resources/SolidContainer";

/**
 * All possible return values when creating and overwriting a container
 */
export type ContainerCreateAndOverwriteResult =
  | CreateSuccess<SolidContainer>
  | CreateAndOverwriteResultErrors<SolidContainer>;

/**
 * All possible return values when creating and overwriting a leaf
 */
export type LeafCreateAndOverwriteResult =
  | CreateSuccess<SolidLeaf>
  | CreateAndOverwriteResultErrors<SolidLeaf>;

/**
 * All possible return values when creating a container if absent
 */
export type ContainerCreateIfAbsentResult =
  | CreateSuccess<SolidContainer>
  | Exclude<ReadContainerResult, AbsentReadSuccess<any>>
  | CreateIfAbsentResultErrors<SolidContainer>;

/**
 * All possible return values when creating a leaf if absent
 */
export type LeafCreateIfAbsentResult =
  | CreateSuccess<SolidLeaf>
  | Exclude<ReadLeafResult, AbsentReadSuccess<any>>
  | CreateIfAbsentResultErrors<SolidLeaf>;

/**
 * All possible errors returned by creating and overwriting a resource
 */
export type CreateAndOverwriteResultErrors<ResourceType extends Resource> =
  | DeleteResultError<ResourceType>
  | CreateErrors<ResourceType>;

/**
 * All possible errors returned by creating a resource if absent
 */
export type CreateIfAbsentResultErrors<ResourceType extends Resource> =
  | ReadResultError<ResourceType>
  | CreateErrors<ResourceType>;

/**
 * All possible errors returned by creating a resource
 */
export type CreateErrors<ResourceType extends Resource> =
  | HttpErrorResultType<ResourceType>
  | UnexpectedResourceError<ResourceType>;

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
  resource: SolidLeaf,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateAndOverwriteResult>;
export function createDataResource(
  resouce: SolidLeaf,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<LeafCreateAndOverwriteResult>;
export function createDataResource(
  resouce: SolidContainer,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateIfAbsentResult>;
export function createDataResource(
  resouce: SolidLeaf,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult>;
export function createDataResource(
  resouce: SolidContainer,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateIfAbsentResult | ContainerCreateAndOverwriteResult>;
export function createDataResource(
  resouce: SolidLeaf,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult | LeafCreateAndOverwriteResult>;
export function createDataResource(
  resource: SolidContainer | SolidLeaf,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateAndOverwriteResult | LeafCreateAndOverwriteResult>;
export function createDataResource(
  resource: SolidContainer | SolidLeaf,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult | LeafCreateIfAbsentResult>;
export function createDataResource(
  resource: SolidContainer | SolidLeaf,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<
  | ContainerCreateAndOverwriteResult
  | LeafCreateAndOverwriteResult
  | ContainerCreateIfAbsentResult
  | LeafCreateIfAbsentResult
>;
export async function createDataResource(
  resource: SolidContainer | SolidLeaf,
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
      const deleteResult = await deleteResource(resource, options);
      // Return if it wasn't deleted
      if (deleteResult.isError)
        return deleteResult as
          | DeleteResultError<SolidLeaf>
          | DeleteResultError<SolidContainer>;
      didOverwrite = deleteResult.resourceExisted;
    } else {
      // Perform a read to check if it exists
      const readResult = await readResource(resource, options);

      // If it does exist stop and return.
      if (readResult.type !== "absentReadSuccess") {
        return readResult;
      }
    }
    // Create the document
    const parentUri = getParentUri(resource.uri)!;
    const headers: HeadersInit = {
      "content-type": "text/turtle",
      slug: getSlug(resource.uri),
    };
    if (resource.type === "SolidContainer") {
      headers.link = '<http://www.w3.org/ns/ldp#Container>; rel="type"';
    }
    const response = await fetch(parentUri, {
      method: "post",
      headers,
    });

    const httpError = HttpErrorResult.checkResponse(resource, response);
    if (httpError)
      return httpError as
        | HttpErrorResultType<SolidContainer>
        | HttpErrorResultType<SolidLeaf>;

    if (options?.dataset) {
      addResourceRdfToContainer(resource.uri, options.dataset);
    }
    return new CreateSuccess(resource, didOverwrite) as
      | CreateSuccess<SolidLeaf>
      | CreateSuccess<SolidContainer>;
  } catch (err) {
    return UnexpectedResourceError.fromThrown(resource, err) as
      | UnexpectedResourceError<SolidContainer>
      | UnexpectedResourceError<SolidLeaf>;
  }
}
