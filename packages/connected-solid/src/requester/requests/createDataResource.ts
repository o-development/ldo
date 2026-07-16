/* eslint-disable @typescript-eslint/no-explicit-any */
import { guaranteeFetch } from "../../util/guaranteeFetch";
import type { AbsentReadSuccess, Resource } from "@ldo/connected";
import { UnexpectedResourceError } from "@ldo/connected";
import type { HttpErrorResultType } from "../results/error/HttpErrorResult";
import { HttpErrorResult } from "../results/error/HttpErrorResult";
import { CreateSuccess } from "../results/success/CreateSuccess";
import type {
  ReadContainerResult,
  ReadLeafResult,
  ReadResultError,
} from "./readResource";
import { readResource } from "./readResource";
import type { DatasetRequestOptions } from "./requestOptions";
import type { SolidLeaf } from "../../resources/SolidLeaf";
import type { SolidContainer } from "../../resources/SolidContainer";
import { addResourceRdfToContainer } from "../../util/rdfUtils";
import { NoncompliantPodError } from "../results/error/NoncompliantPodError.js";

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
  CreateErrors<ResourceType>;

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
export function createDataResource(
  resource: SolidLeaf,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateAndOverwriteResult>;
export function createDataResource(
  resource: SolidLeaf,
  overwrite: true,
  options?: DatasetRequestOptions,
): Promise<LeafCreateAndOverwriteResult>;
export function createDataResource(
  resource: SolidContainer,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateIfAbsentResult>;
export function createDataResource(
  resource: SolidLeaf,
  overwrite?: false,
  options?: DatasetRequestOptions,
): Promise<LeafCreateIfAbsentResult>;
export function createDataResource(
  resource: SolidContainer,
  overwrite?: boolean,
  options?: DatasetRequestOptions,
): Promise<ContainerCreateIfAbsentResult | ContainerCreateAndOverwriteResult>;
export function createDataResource(
  resource: SolidLeaf,
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

    // Create the document
    const headers: HeadersInit = {
      "content-type": "text/turtle",
    };
    if (resource.type === "SolidContainer") {
      headers.link = '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"';
    }
    if (!overwrite) {
      // https://solidproject.org/TR/protocol#conditional-update
      // https://www.rfc-editor.org/info/rfc9110/#section-13.1.2
      headers["If-None-Match"] = "*";
    }
    const response = await fetch(resource.uri, {
      method: "PUT",
      headers,
    });

    // Check whether If-None-Match: "*" precondition failed.
    // That means we tried to overwrite existing resource when overwriting is forbidden.
    if (response.status === 412) {
      const result = await readResource(resource, options);
      if (result.type === "absentReadSuccess")
        return new NoncompliantPodError(
          resource,
          `Server returned conflicting states: Response status 412 implies the resource ${resource.uri} exists, but it is absent.`,
        ) as
          | NoncompliantPodError<SolidLeaf>
          | NoncompliantPodError<SolidContainer>;
      return result;
    }

    const httpError = HttpErrorResult.checkResponse(resource, response);
    if (httpError)
      return httpError as
        | HttpErrorResultType<SolidContainer>
        | HttpErrorResultType<SolidLeaf>;

    const didOverwrite = response.status !== 201;

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
