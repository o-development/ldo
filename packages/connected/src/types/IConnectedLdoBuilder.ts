import type { LdoBuilder } from "@ldo/ldo";
import type { ConnectedPlugin } from "./ConnectedPlugin";
import type { SubjectNode } from "@ldo/rdf-utils";
import type { ILinkQuery, LQInput } from "./ILinkQuery";
import type { TermWrapper } from "@rdfjs/wrapper";

export interface IConnectedLdoBuilder<
  Type extends TermWrapper,
  Plugins extends ConnectedPlugin[],
> extends LdoBuilder<Type> {
  startLinkQuery<Input extends LQInput<Type>>(
    startingResource: Plugins[number]["types"]["resource"],
    startingSubject: SubjectNode | string,
    linkQueryInput: Input,
  ): ILinkQuery<Type, Input>;
}
