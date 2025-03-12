import type TypedEmitter from "typed-emitter";
import type { ConnectedResult } from "./results/ConnectedResult";
import type { ResourceResult } from "./results/ResourceResult";
import type { SubscriptionCallbacks } from "./notifications/NotificationSubscription";

export type ResourceEventEmitter = TypedEmitter<{
  update: () => void;
  notification: () => void;
}>;

export interface Resource<UriType extends string = string>
  extends ResourceEventEmitter {
  readonly uri: UriType;
  readonly type: string;
  status: ConnectedResult;
  isLoading(): boolean;
  isFetched(): boolean;
  isUnfetched(): boolean;
  isDoingInitialFetch(): boolean;
  isPresent(): boolean;
  isAbsent(): boolean;
  isSubscribedToNotifications(): boolean;
  read(): Promise<ResourceResult<this>>;
  readIfAbsent(): Promise<ResourceResult<this>>;
  subscribeToNotifications(callbacks?: SubscriptionCallbacks): Promise<string>;
  unsubscribeFromNotifications(subscriptionId: string): Promise<void>;
  unsubscribeFromAllNotifications(): Promise<void>;
}
