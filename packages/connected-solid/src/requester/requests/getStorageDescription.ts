import { UnexpectedResourceError } from "@ldo/connected";
import { namedNode } from "@ldo/rdf-utils";
import { parse as parseLinkHeader } from "http-link-header";
import type { SolidContainerUri, SolidLeafUri } from "../../types";
import { guaranteeFetch } from "../../util/guaranteeFetch";
import { rawTurtleToDataset } from "../../util/rdfUtils";
import {
  HttpErrorResult,
  type HttpErrorResultType,
  NotFoundHttpError,
} from "../results/error/HttpErrorResult";
import { NoncompliantPodError } from "../results/error/NoncompliantPodError";
import {
  GetRootContainerFromStorageDescriptionSuccess,
  GetStorageDescriptionUriSuccess,
} from "../results/success/StorageDescriptionSuccess";
import type { BasicRequestOptions } from "./requestOptions";
import type { SolidContainer } from "../../resources/SolidContainer.js";
import type { SolidLeaf } from "../../resources/SolidLeaf.js";

export type GetStorageDescriptionUriError<
  ResourceType extends SolidContainer | SolidLeaf,
> =
  | HttpErrorResultType<ResourceType>
  | NotFoundHttpError<ResourceType>
  | NoncompliantPodError<ResourceType>
  | UnexpectedResourceError<ResourceType>;
export type GetStorageDescriptionUriResult<
  ResourceType extends SolidContainer | SolidLeaf,
> =
  | GetStorageDescriptionUriSuccess
  | GetStorageDescriptionUriError<ResourceType>;

/**
 * Get storage description URI from resource Link headers
 *
 * @param resource - Solid resource we start from
 * @param options - Options object that may contain custom (authenticated) fetch
 *
 * @returns GetStorageDescriptionUriResult
 *
 * https://solidproject.org/TR/protocol#server-storage-description
 */
export async function getStorageDescriptionUri(
  resource: SolidLeaf | SolidContainer,
  options?: BasicRequestOptions,
): Promise<GetStorageDescriptionUriResult<SolidLeaf | SolidContainer>> {
  try {
    const fetch = guaranteeFetch(options?.fetch);
    const response = await fetch(resource.uri, { method: "HEAD" });
    const httpErrorResult = HttpErrorResult.checkResponse(resource, response);
    if (httpErrorResult) return httpErrorResult;
    if (NotFoundHttpError.is(response)) {
      return new NotFoundHttpError(
        resource,
        response,
        "Could not get storage description of the resource because the resource does not exist.",
      );
    }

    const linkHeader = response.headers.get("link");
    if (!linkHeader) {
      return new NoncompliantPodError(
        resource,
        "No link header present in request.",
      );
    }
    const parsedLinkHeader = parseLinkHeader(linkHeader);
    const storageDescriptionLinks = parsedLinkHeader.get(
      "rel",
      "http://www.w3.org/ns/solid/terms#storageDescription",
    );

    if (storageDescriptionLinks.length !== 1) {
      return new NoncompliantPodError(
        resource,
        'There must be one link with a rel="http://www.w3.org/ns/solid/terms#storageDescription"',
      );
    }

    return new GetStorageDescriptionUriSuccess(
      resource,
      storageDescriptionLinks[0].uri as SolidLeafUri,
    );
  } catch (e) {
    return UnexpectedResourceError.fromThrown(resource, e);
  }
}

export type GetRootContainerFromStorageDescriptionError<
  ResourceType extends SolidContainer | SolidLeaf,
> =
  | HttpErrorResultType<ResourceType>
  | NoncompliantPodError<ResourceType>
  | UnexpectedResourceError<ResourceType>;
export type GetRootContainerFromStorageDescriptionResult<
  ResourceType extends SolidContainer | SolidLeaf,
> =
  | GetRootContainerFromStorageDescriptionSuccess
  | GetRootContainerFromStorageDescriptionError<ResourceType>;

/**
 * Fetches storage description by its URI, and extracts root container from it
 * @param storageDescriptionUri - URI of storage description
 * @param resource - The resource that initiated the root container discovery
 * @param options - Options object with (authenticated) fetch function
 *
 * @returns GetRootContainerFromStorageDescriptionResult
 *
 * https://solidproject.org/TR/protocol#storage-description-rdf-type
 */
export async function getRootContainerByStorageDescriptionUri(
  storageDescriptionUri: SolidLeafUri,
  resource: SolidLeaf | SolidContainer,
  options?: BasicRequestOptions,
): Promise<
  GetRootContainerFromStorageDescriptionResult<SolidLeaf | SolidContainer>
> {
  try {
    /**
     * @TODO
     * LDO could be used to fetch and/or process storage description resource
     * Storage description is shared among pod resources. This dataset could be cached. (Where?)
     * For fetching and caching, we would need a dataset. Could we use the resource's own dataset, or would it get polluted with this meta stuff?
     */
    const fetch = guaranteeFetch(options?.fetch);
    const response = await fetch(storageDescriptionUri);
    const errorResult = HttpErrorResult.checkResponse(resource, response);
    if (errorResult) return errorResult;

    if (response.status === 404) {
      return new NoncompliantPodError(
        resource,
        "Storage description resource has not been found.",
      );
    }

    const rawTurtle = await response.text();
    const rawTurtleResult = await rawTurtleToDataset(rawTurtle, response.url);
    if (rawTurtleResult instanceof Error)
      return new NoncompliantPodError(resource, rawTurtleResult.message);

    const dataset = rawTurtleResult;
    const rootContainers = dataset.match(
      null,
      namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      namedNode("http://www.w3.org/ns/pim/space#Storage"),
    );
    const quads = rootContainers.toArray();
    if (quads.length !== 1) {
      return new NoncompliantPodError(
        resource,
        "There should be one storage listed in storage description resource.",
      );
    }
    return new GetRootContainerFromStorageDescriptionSuccess(
      resource,
      quads[0].subject.value as SolidContainerUri,
    );
  } catch (e) {
    return UnexpectedResourceError.fromThrown(resource, e);
  }
}
