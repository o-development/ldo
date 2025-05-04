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
  protected previousTransactionId: string = "INIT";

  // Resource Subscriptions uri -> unsubscribeId
  protected activeResourceSubscriptions: Record<string, string> = {};
  // Unsubscribe IDs for this ResourceLinkQuery
  protected thisUnsubscribeIds = new Set<string>();

  protected curOnDataChanged: nodeEventListener<Quad> | undefined;

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
    this.thisUnsubscribeIds.add(subscriptionId);
    // If there's already a registered onDataChange, we don't need to make a new
    // on for this new subscription
    if (this.curOnDataChanged) {
      return subscriptionId;
    }
    this.curOnDataChanged = async (
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
      this.parentDataset.removeListenerFromAllEvents(this.curOnDataChanged!);

      // Explore the links, with a subscription to re-explore the links if any
      // covered information changes
      const resourcesCurrentlySubscribedTo = new Set(
        Object.keys(this.activeResourceSubscriptions),
      );
      await exploreLinks(
        this.parentDataset,
        this.shapeType,
        this.startingResource,
        this.startingSubject,
        this.linkQueryInput,
        {
          onCoveredDataChanged: this.curOnDataChanged,
          onResourceEncountered: async (resource) => {
            console.log(`RESOURCE ENCOUNTERED! ${resource.uri}`);
            // No need to do anything if we're already subscribed
            if (resourcesCurrentlySubscribedTo.has(resource.uri)) {
              console.log(`No need to subscirbe to ${resource.uri}`);
              resourcesCurrentlySubscribedTo.delete(resource.uri);
              return;
            }
            // Otherwise begin the subscription
            console.log(`Subscirbing to ${resource.uri}`);
            const unsubscribeId = await resource.subscribeToNotifications();
            console.log(`Add to active subscriptions ${resource.uri}`);
            this.activeResourceSubscriptions[resource.uri] = unsubscribeId;
          },
        },
      );
      // Clean up unused subscriptions
      console.log("Cleaning these up", resourcesCurrentlySubscribedTo);
      await Promise.all(
        Array.from(resourcesCurrentlySubscribedTo).map(async (uri) =>
          this.unsubscribeFromResource(uri),
        ),
      );
    };
    await this.curOnDataChanged({}, "BEGIN_SUB", [null, null, null, null]);
    return subscriptionId;
  }

  private async unsubscribeFromResource(uri) {
    const resource = this.parentDataset.getResource(uri);
    const unsubscribeId = this.activeResourceSubscriptions[uri];
    delete this.activeResourceSubscriptions[uri];
    await resource.unsubscribeFromNotifications(unsubscribeId);
  }

  private async fullUnsubscribe(): Promise<void> {
    console.log("Unsubscribing");
    if (this.curOnDataChanged) {
      this.parentDataset.removeListenerFromAllEvents(this.curOnDataChanged);
      this.curOnDataChanged = undefined;
    }
    await Promise.all(
      Object.keys(this.activeResourceSubscriptions).map(async (uri) => {
        this.unsubscribeFromResource(uri);
      }),
    );
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
    return Object.keys(this.activeResourceSubscriptions).map((uri) =>
      this.parentDataset.getResource(uri),
    );
  }
}
