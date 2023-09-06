import type { UnfetchedContainer } from "../../concrete/UnfetchedContainer";
import type { UnfetchedLeaf } from "../../concrete/UnfetchedLeaf";
import type { SolidLdoError } from "../../error/SolidLdoError";
import { FetchStatus } from "./FetchStatus";
import type { FetchedClass } from "./Fetched";

export type UnfetchedClass = UnfetchedContainer | UnfetchedLeaf;
export abstract class Unfetched<
  ReadReturn extends FetchedClass,
  ReadError extends SolidLdoError,
> extends FetchStatus {
  public get didInitialFetch(): false {
    return false;
  }
  public get isAbsent(): undefined {
    return undefined;
  }
  public get isPresent(): undefined {
    return undefined;
  }

  async readIfUnfetched(): Promise<ReadReturn | ReadError> {
    return this.read();
  }
  abstract read(): Promise<ReadReturn | ReadError>;
}
