import type {
  ConnectedContext,
  NotificationSubscription,
  SubscriptionCallbacks,
} from "@ldo/connected";
import { UnexpectedResourceError, UpdateSuccess } from "@ldo/connected";
import {
  Unfetched,
  type ConnectedResult,
  type Resource,
  type ResourceEventEmitter,
} from "@ldo/connected";
import type { NextGraphUri } from "../types";
import EventEmitter from "events";
import type { NextGraphConnectedPlugin } from "../NextGraphConnectedPlugin";
import ng from "nextgraph";
import { changesToSparqlUpdate, type DatasetChanges } from "@ldo/rdf-utils";
import type { NextGraphNotificationMessage } from "../notifications/NextGraphNotificationMessage";
import type { Quad } from "@rdfjs/types";
import { namedNode, quad as createQuad } from "@rdfjs/data-model";
import { NextGraphReadSuccess } from "../results/NextGraphReadSuccess";
import { NextGraphNotificationSubscription } from "../notifications/NextGraphNotificationSubscription";

export class NextGraphResource
  extends (EventEmitter as new () => ResourceEventEmitter)
  implements Resource<NextGraphUri>
{
  public readonly uri: NextGraphUri;
  public readonly type = "NextGraphResource" as const;
  public readonly isError = false as const;
  public status: ConnectedResult;
  protected context: ConnectedContext<NextGraphConnectedPlugin[]>;

  private fetched: boolean = false;
  private loading: boolean = false;
  private present: boolean | undefined = undefined;

  /**
   * @internal
   * Handles notification subscriptions
   */
  protected notificationSubscription: NotificationSubscription<
    NextGraphConnectedPlugin,
    NextGraphNotificationMessage
  >;

  constructor(
    uri: NextGraphUri,
    context: ConnectedContext<NextGraphConnectedPlugin[]>,
  ) {
    super();
    this.uri = uri;
    this.status = new Unfetched(this);
    this.context = context;
    this.notificationSubscription = new NextGraphNotificationSubscription(
      this,
      this.onNotification.bind(this),
      this.context,
    );
  }

  isLoading(): boolean {
    return this.loading;
  }

  isFetched(): boolean {
    return this.fetched;
  }

  isUnfetched(): boolean {
    return !this.fetched;
  }

  isDoingInitialFetch(): boolean {
    return this.loading && !this.fetched;
  }

  isPresent(): boolean | undefined {
    return this.present;
  }

  isAbsent(): boolean | undefined {
    return !this.present;
  }

  isSubscribedToNotifications(): boolean {
    return this.notificationSubscription.isSubscribedToNotifications();
  }

  private handleThrownError(
    err: unknown,
  ): UnexpectedResourceError<NextGraphResource> {
    const error = UnexpectedResourceError.fromThrown(this, err);
    this.loading = false;
    this.status = error;
    this.emit("update");
    return error;
  }

  async read(): Promise<
    NextGraphReadSuccess | UnexpectedResourceError<NextGraphResource>
  > {
    try {
      this.loading = true;
      this.emit("update");

      // Get the data
      const sparqlResult = await ng.sparql_query(
        this.context.nextgraph.sessionId,
        `CONSTRUCT { ?s ?p ?o } WHERE { GRAPH <${this.uri}> { ?s ?p ?o } }`,
        undefined,
        this.uri,
      );
      // Update the dataset
      const graphNode = namedNode(this.uri);
      const dataset = this.context.dataset;
      dataset.deleteMatches(undefined, undefined, undefined, graphNode);
      dataset.addAll(
        sparqlResult.map((ngQuad) => {
          return createQuad(
            ngQuad.subject,
            ngQuad.predicate,
            ngQuad.object,
            graphNode,
          );
        }),
      );

      // Update statuses
      const result = new NextGraphReadSuccess(this, false);
      this.loading = false;
      this.fetched = true;
      this.present = true;
      this.status = result;
      this.emit("update");
      return result;
    } catch (err) {
      if (err === "RepoNotFound") {
        const result = new NextGraphReadSuccess(this, false);
        this.loading = false;
        this.fetched = true;
        this.present = false;
        this.status = result;
        this.emit("update");
        return result;
      }
      return this.handleThrownError(err);
    }
  }

  async readIfUnfetched(): Promise<
    NextGraphReadSuccess | UnexpectedResourceError<NextGraphResource>
  > {
    if (this.isFetched()) {
      return new NextGraphReadSuccess(this, true);
    }
    return this.read();
  }

  async update(
    datasetChanges: DatasetChanges<Quad>,
  ): Promise<
    | UpdateSuccess<NextGraphResource>
    | UnexpectedResourceError<NextGraphResource>
  > {
    this.loading = true;
    this.emit("update");

    // Optimistically apply updates
    this.context.dataset.bulk(datasetChanges);

    try {
      // Perform Update with remote
      await ng.sparql_update(
        this.context.nextgraph.sessionId,
        await changesToSparqlUpdate(datasetChanges),
        this.uri,
      );
      return new UpdateSuccess(this);
    } catch (err) {
      // Revert data on error
      this.context.dataset.bulk({
        added: datasetChanges.removed,
        removed: datasetChanges.added,
      });
      return this.handleThrownError(err);
    }
  }

  protected async onNotification(response: NextGraphNotificationMessage) {
    if (response.V0.State?.graph) {
      const json_str = new TextDecoder().decode(
        response.V0.State.graph.triples,
      );
      const triples = JSON.parse(json_str);

      for (const triple of triples) {
        // deal with each triple
        console.log("STATE", triple);
      }
    } else if (response.V0.Patch?.graph) {
      const inserts_json_str = new TextDecoder().decode(
        response.V0.Patch.graph.inserts,
      );
      const inserts = JSON.parse(inserts_json_str);
      const removes_json_str = new TextDecoder().decode(
        response.V0.Patch.graph.removes,
      );
      const removes = JSON.parse(removes_json_str);

      for (const insert of inserts) {
        // deal with each insert
        console.log("INSERT", insert);
      }
      for (const remove of removes) {
        // deal with each remove
        console.log("REMOVE", remove);
      }
    }
  }

  async subscribeToNotifications(
    callbacks?: SubscriptionCallbacks<NextGraphNotificationMessage>,
  ): Promise<string> {
    return await this.notificationSubscription.subscribeToNotifications(
      callbacks,
    );
  }

  unsubscribeFromNotifications(subscriptionId: string): Promise<void> {
    return this.notificationSubscription.unsubscribeFromNotification(
      subscriptionId,
    );
  }

  unsubscribeFromAllNotifications(): Promise<void> {
    return this.notificationSubscription.unsubscribeFromAllNotifications();
  }
}
