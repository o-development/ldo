import type { AbsentContainer } from "../concrete/AbsentContainer";
import type { AbsentLeaf } from "../concrete/AbsentLeaf";
import type { BinaryLeaf } from "../concrete/BinaryLeaf";
import type { BranchContainer } from "../concrete/BranchContainer";
import type { DataLeaf } from "../concrete/DataLeaf";
import type { RootContainer } from "../concrete/RootContainer";
import type { UnfetchedLeaf } from "../concrete/UnfetchedLeaf";
import type { UnfetchedContainer } from "../concrete/UnfetchedContainer";
import type { SolidLdoError } from "../error/SolidLdoError";
import type { FetchedClass } from "./fetchStatus/Fetched";
import type { AbsentClass } from "./fetchStatus/Absent";
import type { PresentClass } from "./fetchStatus/Present";

export type ResourceClass =
  | RootContainer
  | BranchContainer
  | DataLeaf
  | BinaryLeaf
  | AbsentContainer
  | AbsentLeaf
  | UnfetchedContainer
  | UnfetchedLeaf;
export abstract class Resource {
  readonly uri: string;
  readonly lastUpdated: Date;

  abstract read(): Promise<FetchedClass | SolidLdoError>;
  abstract readIfUnfetched(): Promise<FetchedClass | SolidLdoError>;

  abstract createIfAbsent(): Promise<PresentClass | SolidLdoError>;
  abstract createOrOverride(): Promise<PresentClass | SolidLdoError>;

  abstract deleteIfPresent(): Promise<AbsentClass | SolidLdoError>;

  abstract getCurrent(): ResourceClass;
}
