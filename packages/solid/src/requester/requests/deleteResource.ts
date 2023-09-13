import { namedNode } from "@rdfjs/data-model";
import { AbsentResult } from "../requestResults/AbsentResult";
import { UnexpectedError } from "../requestResults/ErrorResult";
import type { HttpErrorResultType } from "../requestResults/HttpErrorResult";
import { UnexpectedHttpError } from "../requestResults/HttpErrorResult";
import type { RequestParams } from "./requestParams";
import { deleteResourceRdfFromContainer } from "../../util/rdfUtils";

export type DeleteResult = AbsentResult | HttpErrorResultType | UnexpectedError;

export async function deleteResource({
  uri,
  fetch,
  transaction,
}: RequestParams): Promise<DeleteResult> {
  try {
    const response = await fetch(uri, {
      method: "delete",
    });

    // Specifically check for a 205. Annoyingly, the server will return 200 even
    // if it hasn't been deleted when you're unauthenticated. 404 happens when
    // the document never existed
    if (response.status === 205 || response.status === 404) {
      transaction.deleteMatches(
        undefined,
        undefined,
        undefined,
        namedNode(uri),
      );
      deleteResourceRdfFromContainer(uri, transaction);
      return new AbsentResult(uri);
    }
    return new UnexpectedHttpError(uri, response);
  } catch (err) {
    return UnexpectedError.fromThrown(uri, err);
  }
}
