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
import { v4 } from "uuid";
import type { nodeEventListener } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";

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
  protected previousTransactionId: string = "INIT";

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

  async subscribe(): Promise<string> {
    const subscriptionId = v4();
    const onDataChanged: nodeEventListener<Quad> = async (
      _changes,
      transactionId: string,
      _triggering,
    ) => {
      console.log(
        `Transaction ID: ${transactionId}\ntriggering: [${_triggering[0]
          ?.value}, ${_triggering[1]?.value}, ${_triggering[2]
          ?.value}, ${_triggering[3]
          ?.value}]\nadded: ${_changes.added?.toString()}\nremoved:${_changes.removed?.toString()}`,
      );
      // Set a transaction Id, so that we only trigger one re-render
      if (transactionId === this.previousTransactionId) return;
      this.previousTransactionId = transactionId;
      // Remove previous registration
      this.parentDataset.removeListenerFromAllEvents(onDataChanged);

      // Explore the links, with a subscription to re-explore the links if any
      // covered information changes
      await exploreLinks(
        this.parentDataset,
        this.shapeType,
        this.startingResource,
        this.startingSubject,
        this.linkQueryInput,
        {
          onCoveredDataChanged: onDataChanged,
        },
      );
    };
    await onDataChanged({}, "BEGIN_SUB", [null, null, null, null]);
    return subscriptionId;
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
