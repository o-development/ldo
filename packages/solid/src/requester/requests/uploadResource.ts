import {
  addResourceRdfToContainer,
  getParentUri,
  getSlug,
} from "../../util/rdfUtils";
import { BinaryResult } from "../requestResults/BinaryResult";
import type {
  DataResult,
  TurtleFormattingError,
} from "../requestResults/DataResult";
import { UnexpectedError } from "../requestResults/ErrorResult";
import {
  HttpErrorResult,
  type HttpErrorResultType,
} from "../requestResults/HttpErrorResult";
import { deleteResource } from "./deleteResource";
import { readResource } from "./readResource";
import type { RequestParams } from "./requestParams";

export type UploadResult = BinaryResult | HttpErrorResultType | UnexpectedError;
export type UploadResultWithoutOverwrite =
  | UploadResult
  | TurtleFormattingError
  | DataResult;

export function uploadResource(
  params: RequestParams,
  blob: Blob,
  mimeType: string,
  overwrite?: false,
): Promise<UploadResultWithoutOverwrite>;
export function uploadResource(
  params: RequestParams,
  blob: Blob,
  mimeType: string,
  overwrite: true,
): Promise<UploadResult>;
export function uploadResource(
  params: RequestParams,
  blob: Blob,
  mimeType: string,
  overwrite?: boolean,
): Promise<UploadResultWithoutOverwrite | UploadResult>;
export async function uploadResource(
  params: RequestParams,
  blob: Blob,
  mimeType: string,
  overwrite?: boolean,
): Promise<UploadResultWithoutOverwrite | UploadResult> {
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
    const response = await fetch(parentUri, {
      method: "post",
      headers: {
        "content-type": mimeType,
        slug: getSlug(uri),
      },
      body: blob,
    });

    const httpError = HttpErrorResult.checkResponse(uri, response);
    if (httpError) return httpError;

    addResourceRdfToContainer(uri, transaction);
    return new BinaryResult(uri, blob);
  } catch (err) {
    return UnexpectedError.fromThrown(uri, err);
  }
}
