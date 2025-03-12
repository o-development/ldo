/* eslint-disable @typescript-eslint/no-explicit-any */
import type TypedEmitter from "typed-emitter";
import type { ConnectedResult } from "./results/ConnectedResult";
import type { ResourceResult } from "./results/ResourceResult";

export type ResourceEventEmitter = TypedEmitter<{
  update: () => void;
  notification: () => void;
}>;

export interface Resource<UriType extends string = string>
  extends ResourceEventEmitter {
  readonly isError: false;
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
  subscribeToNotifications(callbacks?: {
    onNotification: (message: any) => void;
    onNotificationError: (err: Error) => void;
  }): Promise<string>;
  unsubscribeFromNotifications(subscriptionId: string): Promise<void>;
  unsubscribeFromAllNotifications(): Promise<void>;
}
