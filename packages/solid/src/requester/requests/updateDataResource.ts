import type { DatasetChanges } from "@ldo/rdf-utils";
import type { DataResult } from "../requestResults/DataResult";
import type { HttpErrorResultType } from "../requestResults/HttpErrorResult";
import type { UnexpectedError } from "../requestResults/ErrorResult";
import type { RequestParams } from "./requestParams";

export type UpdateResult = DataResult | HttpErrorResultType | UnexpectedError;

export async function updateDataResource(
  _params: RequestParams,
  _datasetChanges: DatasetChanges,
): Promise<UpdateResult> {
  throw new Error("Not Implemented");
}
