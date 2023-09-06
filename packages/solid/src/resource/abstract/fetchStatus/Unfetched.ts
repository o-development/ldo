import type { UnfetchedContainer } from "../../concrete/UnfetchedContainer";
import type { UnfetchedLeaf } from "../../concrete/UnfetchedLeaf";
import { FetchStatus } from "./FetchStatus";

export type UnfetchedClass = UnfetchedContainer | UnfetchedLeaf;
export abstract class Unfetched extends FetchStatus {
  public get didInitialFetch(): false {
    return false;
  }
  public get isAbsent(): undefined {
    return undefined;
  }
  public get isPresent(): undefined {
    return undefined;
  }
}
