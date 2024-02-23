import type { GetWacUriSuccess } from "./results/GetWacUriSuccess";
import type { HttpErrorResultType } from "../../requester/results/error/HttpErrorResult";
import {
  HttpErrorResult,
  NotFoundHttpError,
} from "../../requester/results/error/HttpErrorResult";
import { UnexpectedResourceError } from "../../requester/results/error/ErrorResult";
import { guaranteeFetch } from "../../util/guaranteeFetch";
import type { BasicRequestOptions } from "../../requester/requests/requestOptions";
import { NoncompliantPodError } from "../../requester/results/error/NoncompliantPodError";
import { parse as parseLinkHeader } from "http-link-header";
import type { LeafUri } from "../../util/uriTypes";

export type GetWacUriError =
  | HttpErrorResultType
  | NotFoundHttpError
  | NoncompliantPodError
  | UnexpectedResourceError;
export type GetWacUriResult = GetWacUriSuccess | GetWacUriError;

export async function getWacUri(
  resourceUri: string,
  options?: BasicRequestOptions,
): Promise<GetWacUriResult> {
  try {
    const fetch = guaranteeFetch(options?.fetch);
    const response = await fetch(resourceUri, {
      method: "head",
    });
    const errorResult = HttpErrorResult.checkResponse(resourceUri, response);
    if (errorResult) return errorResult;
    if (NotFoundHttpError.is(response)) {
      return new NotFoundHttpError(
        resourceUri,
        response,
        "Could not get access control rules because the resource does not exist.",
      );
    }
    // Get the URI from the link header
    const linkHeader = response.headers.get("link");
    if (!linkHeader) {
      return new NoncompliantPodError(
        resourceUri,
        "No link header present in request.",
      );
    }
    const parsedLinkHeader = parseLinkHeader(linkHeader);
    const aclUris = parsedLinkHeader.get("rel", "acl");
    if (aclUris.length !== 1) {
      return new NoncompliantPodError(
        resourceUri,
        `There must be one link with a rel="acl"`,
      );
    }
    return {
      type: "getWacUriSuccess",
      isError: false,
      uri: resourceUri,
      wacUri: aclUris[0].uri as LeafUri,
    };
  } catch (err: unknown) {
    return UnexpectedResourceError.fromThrown(resourceUri, err);
  }
}
