import type { ISubscribableDataset } from "@ldo/subscribable-dataset";
import type { ITermWrapperConstructor, TermWrapper } from "@rdfjs/wrapper";
import type { LdoBuilder } from "./LdoBuilder";
import type { Quad } from "@rdfjs/types";

export interface ILdoDataset extends ISubscribableDataset<Quad> {
  usingType<Type extends TermWrapper>(
    termWrapperClass: ITermWrapperConstructor<Type>,
  ): LdoBuilder<Type>;
}
