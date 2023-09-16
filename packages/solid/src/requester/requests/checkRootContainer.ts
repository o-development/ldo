import {
  UnexpectedHttpError,
  type HttpErrorResultType,
} from "../requestResults/HttpErrorResult";
import { UnexpectedError } from "../requestResults/ErrorResult";
import type { SimpleRequestParams } from "./requestParams";
import { parse as parseLinkHeader } from "http-link-header";

export type CheckRootResult = boolean | CheckRootResultError;
export type CheckRootResultError = HttpErrorResultType | UnexpectedError;

export async function checkRootContainer({
  uri,
  fetch,
}: SimpleRequestParams): Promise<CheckRootResult> {
  try {
    // Fetch options to determine the document type
    const response = await fetch(uri, { method: "HEAD" });
    const linkHeader = response.headers.get("link");
    if (!linkHeader) {
      return new UnexpectedHttpError(
        uri,
        response,
        "No link header present in request.",
      );
    }
    const parsedLinkHeader = parseLinkHeader(linkHeader);
    const types = parsedLinkHeader.get("rel", "type");
    return types.some(
      (type) => type.uri === "http://www.w3.org/ns/pim/space#Storage",
    );
  } catch (err) {
    return UnexpectedError.fromThrown(uri, err);
  }
}
