import type { Container } from "../../resource/Container";
import type { Leaf } from "../../resource/Leaf";
import { RequesterResult } from "./RequesterResult";

export class CommitChangesSuccess extends RequesterResult {
  readonly type = "commitChangesSuccess" as const;
  readonly affectedResources: (Leaf | Container)[];
  constructor(uri: string, affectedResources: (Leaf | Container)[]) {
    super(uri);
    this.affectedResources = affectedResources;
  }
}
