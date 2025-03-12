import EventEmitter from "events";
import type { Resource, ResourceEventEmitter } from "./Resource";
import { InvalidUriError } from "./results/error/InvalidUriError";
import type { SubscriptionCallbacks } from "./notifications/NotificationSubscription";

export class InvalidIdentifierResource
  extends (EventEmitter as new () => ResourceEventEmitter)
  implements Resource
{
  public readonly uri: string;
  public readonly type = "InvalidIdentifierResouce" as const;
  public status: InvalidUriError<this>;

  constructor(uri: string) {
    super();
    this.uri = uri;
    this.status = new InvalidUriError(this);
  }

  isLoading(): boolean {
    return false;
  }
  isFetched(): boolean {
    return false;
  }
  isUnfetched(): boolean {
    return true;
  }
  isDoingInitialFetch(): boolean {
    return false;
  }
  isPresent(): boolean {
    return false;
  }
  isAbsent(): boolean {
    return true;
  }
  isSubscribedToNotifications(): boolean {
    return false;
  }
  async read(): Promise<InvalidUriError<this>> {
    return this.status;
  }
  async readIfAbsent(): Promise<InvalidUriError<this>> {
    return this.status;
  }
  async createAndOverwrite(): Promise<InvalidUriError<this>> {
    return this.status;
  }
  async createIfAbsent(): Promise<InvalidUriError<this>> {
    return this.status;
  }
  async subscribeToNotifications(
    _callbacks?: SubscriptionCallbacks,
  ): Promise<string> {
    throw new Error("Cannot subscribe to an invalid resource.");
  }
  async unsubscribeFromNotifications(_subscriptionId: string): Promise<void> {
    // Do Nothing
  }
  async unsubscribeFromAllNotifications(): Promise<void> {
    // Do Nothing
  }
}
