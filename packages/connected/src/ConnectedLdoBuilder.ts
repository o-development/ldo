import { LdoBuilder } from "@ldo/ldo";
import type { IConnectedLdoBuilder } from "./types/IConnectedLdoBuilder";
import type { SubjectNode, GraphNode } from "@ldo/rdf-utils";
import type { LQInput } from "./types/ILinkQuery";
import { ResourceLinkQuery } from "./linkTraversal/ResourceLinkQuery";
import type { ConnectedPlugin } from "./types/ConnectedPlugin";
import type { IConnectedLdoDataset } from "./types/IConnectedLdoDataset";
import type { TermWrapper, ITermWrapperConstructor } from "@rdfjs/wrapper";
import type { DataFactory } from "@rdfjs/types";

export class ConnectedLdoBuilder<
    Type extends TermWrapper,
    Plugins extends ConnectedPlugin[],
  >
  extends LdoBuilder<Type>
  implements IConnectedLdoBuilder<Type, Plugins>
{
  constructor(
    protected readonly termWrapperClass: ITermWrapperConstructor<Type>,
    protected readonly dataset: IConnectedLdoDataset<Plugins>,
    protected readonly factory: DataFactory,
    config?: { writeGraphs: GraphNode[] },
  ) {
    super(termWrapperClass, dataset, factory, config);
  }

  startLinkQuery<Input extends LQInput<Type>>(
    startingResource: Plugins[number]["types"]["resource"],
    startingSubject: SubjectNode | string,
    linkQueryInput: Input,
  ): ResourceLinkQuery<Type, Input, Plugins> {
    return new ResourceLinkQuery(
      this.dataset,
      this.termWrapperClass,
      this,
      startingResource,
      startingSubject,
      linkQueryInput,
    );
  }
}
