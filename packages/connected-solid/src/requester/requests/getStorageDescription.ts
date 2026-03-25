import { UnexpectedResourceError } from "@ldo/connected";
import { parse as parseLinkHeader } from "http-link-header";
import type { SolidLeafUri } from "../../types";
import { guaranteeFetch } from "../../util/guaranteeFetch";
import {
  HttpErrorResult,
  type HttpErrorResultType,
  NotFoundHttpError,
} from "../results/error/HttpErrorResult";
import { NoncompliantPodError } from "../results/error/NoncompliantPodError";
import { GetStorageDescriptionUriSuccess } from "../results/success/StorageDescriptionSuccess";
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
