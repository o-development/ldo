import {
  addResourceRdfToContainer,
  getParentUri,
  getSlug,
} from "../../util/rdfUtils";
import { isContainerUri } from "../../util/uriTypes";
import type { BinaryResult } from "../requestResults/BinaryResult";
import type { TurtleFormattingError } from "../requestResults/DataResult";
import { DataResult } from "../requestResults/DataResult";
import { UnexpectedError } from "../requestResults/ErrorResult";
import type { HttpErrorResultType } from "../requestResults/HttpErrorResult";
import { HttpErrorResult } from "../requestResults/HttpErrorResult";
import { deleteResource } from "./deleteResource";
import { readResource } from "./readResource";
import type { RequestParams } from "./requestParams";

export type CreateResult = DataResult | CreateResultErrors;
export type CreateResultErrors = HttpErrorResultType | UnexpectedError;
export type CreateResultWithoutOverwrite =
  | CreateResult
  | CreateResultWithoutOverwriteErrors
  | BinaryResult;
export type CreateResultWithoutOverwriteErrors =
  | TurtleFormattingError
  | CreateResultErrors;

export function createDataResource(
  params: RequestParams,
  overwrite?: false,
): Promise<CreateResultWithoutOverwrite>;
export function createDataResource(
  params: RequestParams,
  overwrite: true,
): Promise<CreateResult>;
export function createDataResource(
  params: RequestParams,
  overwrite?: boolean,
): Promise<CreateResultWithoutOverwrite | CreateResult>;
export async function createDataResource(
  params: RequestParams,
  overwrite?: boolean,
): Promise<CreateResultWithoutOverwrite> {
  const { uri, transaction, fetch } = params;
  try {
    if (overwrite) {
      const deleteResult = await deleteResource(params);
      // Return if it wasn't deleted
      if (deleteResult.type !== "absent") {
        return deleteResult;
      }
    } else {
      // Perform a read to check if it exists
      const readResult = await readResource(params);
      // If it does exist stop and return.
      if (readResult.type !== "absent") {
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

    addResourceRdfToContainer(uri, transaction);
    return new DataResult(uri);
  } catch (err) {
    return UnexpectedError.fromThrown(uri, err);
  }
}
