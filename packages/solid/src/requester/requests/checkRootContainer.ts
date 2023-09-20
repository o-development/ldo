import type { BasicRequestOptions } from "./requestOptions";
import { parse as parseLinkHeader } from "http-link-header";
import { NoncompliantPodError } from "../results/error/NoncompliantPodError";
import type { CheckRootContainerSuccess } from "../results/success/CheckRootContainerSuccess";
import type {
  HttpErrorResultType,
  UnexpectedHttpError,
} from "../results/error/HttpErrorResult";
import { HttpErrorResult } from "../results/error/HttpErrorResult";
import { UnexpectedResourceError } from "../results/error/ErrorResult";
import { guaranteeFetch } from "../../util/guaranteeFetch";
import type { ContainerUri } from "../../util/uriTypes";

export type CheckRootResult = CheckRootContainerSuccess | CheckRootResultError;
export type CheckRootResultError =
  | HttpErrorResultType
  | NoncompliantPodError
  | UnexpectedHttpError
  | UnexpectedResourceError;

export function checkHeadersForRootContainer(
  uri: ContainerUri,
  headers: Headers,
): CheckRootContainerSuccess | NoncompliantPodError {
  const linkHeader = headers.get("link");
  if (!linkHeader) {
    return new NoncompliantPodError(uri, "No link header present in request.");
  }
  const parsedLinkHeader = parseLinkHeader(linkHeader);
  const types = parsedLinkHeader.get("rel", "type");
  const isRootContainer = types.some(
    (type) => type.uri === "http://www.w3.org/ns/pim/space#Storage",
  );
  return {
    uri,
    isRootContainer,
    type: "checkRootContainerSuccess",
    isError: false,
  };
}

export async function checkRootContainer(
  uri: ContainerUri,
  options?: BasicRequestOptions,
): Promise<CheckRootResult> {
  try {
    const fetch = guaranteeFetch(options?.fetch);
    // Fetch options to determine the document type
    const response = await fetch(uri, { method: "HEAD" });
    const httpErrorResult = HttpErrorResult.checkResponse(uri, response);
    if (httpErrorResult) return httpErrorResult;

    return checkHeadersForRootContainer(uri, response.headers);
  } catch (err) {
    return UnexpectedResourceError.fromThrown(uri, err);
  }
}
