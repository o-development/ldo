import type { Container } from "../../../resource/Container";
import type { Leaf } from "../../../resource/Leaf";
import type { RequesterResult } from "../RequesterResult";

export abstract class SuccessResult implements RequesterResult {
  readonly isError = false as const;
  abstract readonly type: string;
  resource?: Leaf | Container;
}

export abstract class ResourceSuccess extends SuccessResult {
  readonly uri: string;

  constructor(uri: string) {
    super();
    this.uri = uri;
  }
}

export class AggregateSuccess<
  SuccessType extends SuccessResult,
> extends SuccessResult {
  readonly type = "aggregateError" as const;
  readonly results: SuccessType[];

  constructor(results: SuccessType[]) {
    super();
    this.results = results;
  }
}
