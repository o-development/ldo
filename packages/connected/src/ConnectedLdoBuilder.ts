import type { LdoBase, ShapeType } from "@ldo/ldo";
import { LdoBuilder } from "@ldo/ldo";
import type { IConnectedLdoBuilder } from "./types/IConnectedLdoBuilder";
import type { JsonldDatasetProxyBuilder } from "@ldo/jsonld-dataset-proxy";
import type { SubjectNode } from "@ldo/rdf-utils";
import type { LQInput, ILinkQuery } from "./types/ILinkQuery";
import { ResourceLinkQuery } from "./linkTraversal/ResourceLinkQuery";
import type { ConnectedPlugin } from "./types/ConnectedPlugin";
import type { IConnectedLdoDataset } from "./types/IConnectedLdoDataset";

export class ConnectedLdoBuilder<
    Type extends LdoBase,
    Plugins extends ConnectedPlugin[],
  >
  extends LdoBuilder<Type>
  implements IConnectedLdoBuilder<Type, Plugins>
{
  protected parentDataset: IConnectedLdoDataset<Plugins>;

  constructor(
    parentDataset: IConnectedLdoDataset<Plugins>,
    jsonldDatasetProxyBuilder: JsonldDatasetProxyBuilder,
    shapeType: ShapeType<Type>,
  ) {
    super(jsonldDatasetProxyBuilder, shapeType);
    this.parentDataset = parentDataset;
  }

  startLinkQuery<Input extends LQInput<Type>>(
    startingResource: Plugins[number]["types"]["resource"],
    startingSubject: SubjectNode | string,
    linkQueryInput: Input,
  ): ILinkQuery<Type, Input> {
    return new ResourceLinkQuery(
      this.parentDataset,
      this.shapeType,
      this,
      startingResource,
      startingSubject,
      linkQueryInput,
    );
  }
}
