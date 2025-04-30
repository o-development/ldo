import type { LdoBase, ShapeType } from "@ldo/ldo";
import type {
  ExpandDeep,
  ILinkQuery,
  LQInput,
  LQReturn,
} from "../types/ILinkQuery";
import type { ConnectedPlugin } from "../types/ConnectedPlugin";
import type { SubjectNode } from "@ldo/rdf-utils";
import { exploreLinks } from "./exploreLinks";
import type { IConnectedLdoDataset } from "../types/IConnectedLdoDataset";
import type { IConnectedLdoBuilder } from "../types/IConnectedLdoBuilder";

export class ResourceLinkQuery<
  Type extends LdoBase,
  QueryInput extends LQInput<Type>,
  Plugins extends ConnectedPlugin[],
> implements ILinkQuery<Type, QueryInput>
{
  protected trackedResources: Set<Plugins[number]["types"]["resource"]> =
    new Set();
  // uri -> unsubscribeId
  protected resourceUnsubscribeIds: Record<string, string> = {};
  protected thisUnsubscribeIds: Set<string> = new Set();

  constructor(
    protected parentDataset: IConnectedLdoDataset<Plugins>,
    protected shapeType: ShapeType<Type>,
    protected ldoBuilder: IConnectedLdoBuilder<Type, Plugins>,
    protected startingResource: Plugins[number]["types"]["resource"],
    protected startingSubject: SubjectNode | string,
    protected linkQueryInput: QueryInput,
  ) {}

  async run(options?: {
    reload?: boolean;
  }): Promise<ExpandDeep<LQReturn<Type, QueryInput>>> {
    await exploreLinks(
      this.parentDataset,
      this.shapeType,
      this.startingResource,
      this.startingSubject,
      this.linkQueryInput,
      { shouldRefreshResources: options?.reload },
    );
    return this.fromSubject();
  }

  subscribe(): Promise<string> {
    throw new Error("Method not implemented.");
  }

  private async fullUnsubscribe(): Promise<void> {
    // TODO
  }

  async unsubscribe(unsubscribeId: string): Promise<void> {
    this.thisUnsubscribeIds.delete(unsubscribeId);
    if (this.thisUnsubscribeIds.size === 0) {
      await this.fullUnsubscribe();
    }
  }

  fromSubject(): ExpandDeep<LQReturn<Type, QueryInput>> {
    return this.ldoBuilder.fromSubject(
      this.startingSubject,
    ) as unknown as ExpandDeep<LQReturn<Type, QueryInput>>;
  }

  getSubscribedResources(): Plugins[number]["types"]["resource"][] {
    return Object.keys(this.resourceUnsubscribeIds).map((uri) =>
      this.parentDataset.getResource(uri),
    );
  }
}
