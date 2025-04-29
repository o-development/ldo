import type { LdoBase, ShapeType } from "@ldo/ldo";
import { LdoBuilder } from "@ldo/ldo";
import type { IConnectedLdoBuilder } from "./types/IConnectedLdoBuilder";
import type { JsonldDatasetProxyBuilder } from "@ldo/jsonld-dataset-proxy";
import type { SubjectNode } from "@ldo/rdf-utils";
import type { LQInput, ILinkQuery } from "./types/ILinkQuery";
import { ResourceLinkQuery } from "./ResourceLinkQuery";
import type { ConnectedLdoDataset } from "./ConnectedLdoDataset";
import type { ConnectedPlugin } from "./types/ConnectedPlugin";

export class ConnectedLdoBuilder<
    Type extends LdoBase,
    Plugins extends ConnectedPlugin[],
  >
  extends LdoBuilder<Type>
  implements IConnectedLdoBuilder<Type, Plugins>
{
  protected parentDataset: ConnectedLdoDataset<Plugins>;

  constructor(
    parentDataset: ConnectedLdoDataset<Plugins>,
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
      this.jsonldDatasetProxyBuilder,
      startingResource,
      startingSubject,
      linkQueryInput,
    );
  }
}
