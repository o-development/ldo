import type { LdoBase, LdoBuilder } from "@ldo/ldo";
import type { ConnectedPlugin } from "./ConnectedPlugin";
import { SubjectNode } from "@ldo/rdf-utils";

export interface IConnectedLdoBuilder<
  Type extends LdoBase,
  Plugins extends ConnectedPlugin[],
> extends LdoBuilder<Type> {
  fromLinkQuery(startingResource: Plugins[number]["types"]["resource"], startingSubject: SubjectNode | string, linkQueryInput: 
    
  )
}
