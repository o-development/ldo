import type {
  SolidLeafUri,
  SolidContainer,
  SolidLeaf,
  BasicRequestOptions,
  HttpErrorResultType,
} from "@ldo/connected-solid";
import {
  HttpErrorResult,
  NotFoundHttpError,
  NoncompliantPodError,
  guaranteeFetch,
} from "@ldo/connected-solid";
import { GetWacUriSuccess } from "./results/GetWacUriSuccess";
import LinkHeader from "http-link-header";
import { UnexpectedResourceError } from "@ldo/connected";

export type GetWacUriError<ResourceType extends SolidContainer | SolidLeaf> =
  | HttpErrorResultType<ResourceType>
  | NotFoundHttpError<ResourceType>
  | NoncompliantPodError<ResourceType>
  | UnexpectedResourceError<ResourceType>;
export type GetWacUriResult<ResourceType extends SolidContainer | SolidLeaf> =
  | GetWacUriSuccess<ResourceType>
  | GetWacUriError<ResourceType>;

/**
 * Get the URI for the WAC rules of a specific resource
 * @param resourceUri: the URI of the resource
 * @param options: Options object to include an authenticated fetch function
 * @returns GetWacUriResult
 */
export async function getWacUri(
  resource: SolidLeaf | SolidContainer,
  options?: BasicRequestOptions,
): Promise<GetWacUriResult<SolidLeaf | SolidContainer>> {
  try {
    const fetch = guaranteeFetch(options?.fetch);
    const response = await fetch(resource.uri, {
      method: "head",
    });
    const errorResult = HttpErrorResult.checkResponse(resource, response);
    if (errorResult) return errorResult;
    if (NotFoundHttpError.is(response)) {
      return new NotFoundHttpError(
        resource,
        response,
        "Could not get access control rules because the resource does not exist.",
      );
    }
    // Get the URI from the link header
    const linkHeader = response.headers.get("link");
    if (!linkHeader) {
      return new NoncompliantPodError(
        resource,
        "No link header present in request.",
      );
    }
    const parsedLinkHeader = LinkHeader.parse(linkHeader);
    const aclUris = parsedLinkHeader.get("rel", "acl");
    if (aclUris.length !== 1) {
      return new NoncompliantPodError(
        resource,
        `There must be one link with a rel="acl"`,
      );
    }

    return new GetWacUriSuccess(resource, aclUris[0].uri as SolidLeafUri);
  } catch (err: unknown) {
    return UnexpectedResourceError.fromThrown(resource, err);
  }
}
