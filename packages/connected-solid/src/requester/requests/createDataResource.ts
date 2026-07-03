/* eslint-disable @typescript-eslint/no-explicit-any */
import { guaranteeFetch } from "../../util/guaranteeFetch";
import type {
  AbsentReadSuccess,
  ApplyCapabilities,
  Resource,
  ResourceCapability,
} from "@ldo/connected";
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
import {
  addResourceRdfToContainer,
  getParentUri,
  getSlug,
} from "../../util/rdfUtils";

/**
 * All possible return values when creating and overwriting a container
 */
export type ContainerCreateAndOverwriteResult<
  Capabilities extends ResourceCapability<string, any>[],
> =
  | CreateSuccess<ApplyCapabilities<SolidContainer<Capabilities>, Capabilities>>
  | CreateAndOverwriteResultErrors<SolidContainer<any[]>>;

/**
 * All possible return values when creating and overwriting a leaf
 */
export type LeafCreateAndOverwriteResult<
  Capabilities extends ResourceCapability<string, any>[],
> =
  | CreateSuccess<ApplyCapabilities<SolidLeaf<Capabilities>, Capabilities>>
  | CreateAndOverwriteResultErrors<SolidLeaf<Capabilities>>;

/**
 * All possible return values when creating a container if absent
 */
export type ContainerCreateIfAbsentResult<
  Capabilities extends ResourceCapability<string, any>[],
> =
  | CreateSuccess<ApplyCapabilities<SolidContainer<Capabilities>, Capabilities>>
  | Exclude<ReadContainerResult, AbsentReadSuccess<any>>
  | CreateIfAbsentResultErrors<SolidContainer<any[]>>;

/**
 * All possible return values when creating a leaf if absent
 */
export type LeafCreateIfAbsentResult<
  Capabilities extends ResourceCapability<string, any>[],
> =
  | CreateSuccess<ApplyCapabilities<SolidLeaf<Capabilities>, Capabilities>>
  | Exclude<ReadLeafResult, AbsentReadSuccess<any>>
  | CreateIfAbsentResultErrors<SolidLeaf<any[]>>;

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
 * @internal
 * Creates a data resource (RDF resource) at the provided URI. This resource
 * could also be a container.
 *
 * @param resource - The resource
 * @param overwrite - If true, the request will overwrite any previous resource
 * at this URI.
 * @param options - Options to provide a fetch function and a local dataset to
 * update.
 * @returns One of many create results depending on the input
 */
export function createDataResource<
  Capabilities extends ResourceCapability<string, any>[],
>(
  resource: SolidLeaf<Capabilities>,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateAndOverwriteResult<Capabilities>>;
export function createDataResource<
  Capabilities extends ResourceCapability<string, any>[],
>(
  resource: SolidLeaf<Capabilities>,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<LeafCreateAndOverwriteResult<Capabilities>>;
export function createDataResource<
  Capabilities extends ResourceCapability<string, any>[],
>(
  resource: SolidContainer<Capabilities>,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateIfAbsentResult<Capabilities>>;
export function createDataResource<
  Capabilities extends ResourceCapability<string, any>[],
>(
  resource: SolidLeaf<Capabilities>,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult<Capabilities>>;
export function createDataResource<
  Capabilities extends ResourceCapability<string, any>[],
>(
  resource: SolidContainer<Capabilities>,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<
  | ContainerCreateIfAbsentResult<Capabilities>
  | ContainerCreateAndOverwriteResult<Capabilities>
>;
export function createDataResource<
  Capabilities extends ResourceCapability<string, any>[],
>(
  resource: SolidLeaf<Capabilities>,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<
  | LeafCreateIfAbsentResult<Capabilities>
  | LeafCreateAndOverwriteResult<Capabilities>
>;
export function createDataResource<
  Capabilities extends ResourceCapability<string, any>[],
>(
  resource: SolidContainer<Capabilities> | SolidLeaf<Capabilities>,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<
  | ContainerCreateAndOverwriteResult<Capabilities>
  | LeafCreateAndOverwriteResult<Capabilities>
>;
export function createDataResource<
  Capabilities extends ResourceCapability<string, any>[],
>(
  resource: SolidContainer<Capabilities> | SolidLeaf<Capabilities>,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<
  | LeafCreateIfAbsentResult<Capabilities>
  | LeafCreateIfAbsentResult<Capabilities>
>;
export function createDataResource<
  Capabilities extends ResourceCapability<string, any>[],
>(
  resource: SolidContainer<Capabilities> | SolidLeaf<Capabilities>,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<
  | ContainerCreateAndOverwriteResult<Capabilities>
  | LeafCreateAndOverwriteResult<Capabilities>
  | ContainerCreateIfAbsentResult<Capabilities>
  | LeafCreateIfAbsentResult<Capabilities>
>;
export async function createDataResource<
  Capabilities extends ResourceCapability<string, any>[],
>(
  resource: SolidContainer<Capabilities> | SolidLeaf<Capabilities>,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<
  | ContainerCreateAndOverwriteResult<Capabilities>
  | LeafCreateAndOverwriteResult<Capabilities>
  | ContainerCreateIfAbsentResult<Capabilities>
  | LeafCreateIfAbsentResult<Capabilities>
> {
  try {
    const fetch = guaranteeFetch(options?.fetch);
    let didOverwrite = false;
    if (overwrite) {
      const deleteResult = await deleteResource(resource, options);
      // Return if it wasn't deleted
      if (deleteResult.isError)
        return deleteResult as
          | DeleteResultError<SolidLeaf<Capabilities>>
          | DeleteResultError<SolidContainer<Capabilities>>;
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
      headers.link = '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"';
    }
    const response = await fetch(parentUri, {
      method: "post",
      headers,
    });

    const httpError = HttpErrorResult.checkResponse(resource, response);
    if (httpError)
      return httpError as
        | HttpErrorResultType<SolidContainer<any[]>>
        | HttpErrorResultType<SolidLeaf<any[]>>;

    if (options?.dataset) {
      addResourceRdfToContainer(resource.uri, options.dataset);
    }
    return new CreateSuccess(resource, didOverwrite) as
      | CreateSuccess<ApplyCapabilities<SolidLeaf<Capabilities>, Capabilities>>
      | CreateSuccess<
          ApplyCapabilities<SolidContainer<Capabilities>, Capabilities>
        >;
  } catch (err) {
    return UnexpectedResourceError.fromThrown(resource, err) as
      | UnexpectedResourceError<SolidContainer<any[]>>
      | UnexpectedResourceError<SolidLeaf<any[]>>;
  }
}
