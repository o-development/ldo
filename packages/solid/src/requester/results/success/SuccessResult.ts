import type { RequesterResult } from "../RequesterResult";

export interface SuccessResult extends RequesterResult {
  isError: false;
}

export interface ResourceSuccess extends SuccessResult {
  uri: string;
}

export interface AggregateSuccess<SuccessType extends SuccessResult>
  extends SuccessResult {
  type: "aggregateSuccess";
  results: SuccessType[];
}
