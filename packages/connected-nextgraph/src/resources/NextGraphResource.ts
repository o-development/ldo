import type {
  ConnectedContext,
  ReadSuccess,
  UpdateSuccess,
} from "@ldo/connected";
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
import type { DatasetChanges } from "@ldo/rdf-utils";

export class NextGraphResource
  extends (EventEmitter as new () => ResourceEventEmitter)
  implements Resource<NextGraphUri>
{
  public readonly uri: NextGraphUri;
  public readonly type = "NextGraphResource" as const;
  public readonly isError = false as const;
  public status: ConnectedResult;
  protected context: ConnectedContext<NextGraphConnectedPlugin[]>;

  constructor(
    uri: NextGraphUri,
    context: ConnectedContext<NextGraphConnectedPlugin[]>,
  ) {
    super();
    this.uri = uri;
    this.status = new Unfetched(this);
    this.context = context;
  }

  isLoading(): boolean {
    throw new Error("Method not implemented.");
  }

  isFetched(): boolean {
    throw new Error("Method not implemented.");
  }

  isUnfetched(): boolean {
    throw new Error("Method not implemented.");
  }

  isDoingInitialFetch(): boolean {
    throw new Error("Method not implemented.");
  }

  isPresent(): boolean {
    throw new Error("Method not implemented.");
  }

  isAbsent(): boolean {
    throw new Error("Method not implemented.");
  }

  isSubscribedToNotifications(): boolean {
    throw new Error("Method not implemented.");
  }

  read(): Promise<ReadSuccess<NextGraphResource>> {
    throw new Error("Method not implemented.");
  }

  readIfUnfetched(): Promise<ReadSuccess<NextGraphResource>> {
    throw new Error("Method not implemented.");
  }

  update(
    _datasetChanges: DatasetChanges,
  ): Promise<UpdateSuccess<NextGraphResource>> {
    throw new Error("Method Not Implemented");
  }

  protected async onNotification(message: unknown) {
    // TODO
  }

  subscribeToNotifications(callbacks?: SubscriptionCallbacks): Promise<string> {
    throw new Error("Method not implemented.");
  }

  unsubscribeFromNotifications(subscriptionId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  unsubscribeFromAllNotifications(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
