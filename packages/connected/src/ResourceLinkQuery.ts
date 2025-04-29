import type { LdoBase, ShapeType } from "@ldo/ldo";
import type {
  ExpandDeep,
  ILinkQuery,
  LQInput,
  LQReturn,
} from "./types/ILinkQuery";
import type { ConnectedPlugin } from "./types/ConnectedPlugin";
import type { JsonldDatasetProxyBuilder } from "@ldo/jsonld-dataset-proxy";
import type { ConnectedLdoDataset } from "./ConnectedLdoDataset";
import type { SubjectNode } from "@ldo/rdf-utils";

export class ResourceLinkQuery<
  Type extends LdoBase,
  QueryInput extends LQInput<Type>,
  Plugins extends ConnectedPlugin[],
> implements ILinkQuery<Type, QueryInput>
{
  constructor(
    protected parentDataset: ConnectedLdoDataset<Plugins>,
    protected shapeType: ShapeType<Type>,
    protected jsonldDatasetProxyBuilder: JsonldDatasetProxyBuilder,
    protected startingResource: Plugins[number]["types"]["resource"],
    protected startingSubject: SubjectNode | string,
    protected linkQueryInput: QueryInput,
  ) {}

  run(): Promise<ExpandDeep<LQReturn<Type, QueryInput>>> {
    throw new Error("Method not implemented.");
  }

  subscribe(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  unsubscribe(): void {
    throw new Error("Method not implemented.");
  }

  fromSubject(): ExpandDeep<LQReturn<Type, QueryInput>> {
    throw new Error("Method not implemented.");
  }
}
