/* eslint-disable @typescript-eslint/no-explicit-any */
import type TypedEmitter from "typed-emitter";
import type { ConnectedResult } from "./results/ConnectedResult";
import type { DatasetChanges } from "@ldo/rdf-utils";
import type { UpdateSuccess } from "./results/success/UpdateSuccess";
import type { ResourceError } from "./results/error/ErrorResult";
import type { ReadSuccess } from "./results/success/ReadSuccess";

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
  isPresent(): boolean | undefined;
  isAbsent(): boolean | undefined;
  isSubscribedToNotifications(): boolean;
  read(): Promise<ReadSuccess<any> | ResourceError<any>>;
  readIfAbsent(): Promise<ReadSuccess<any> | ResourceError<any>>;
  update(
    datasetChanges: DatasetChanges,
  ): Promise<UpdateSuccess<any> | ResourceError<any>>;
  subscribeToNotifications(callbacks?: {
    onNotification: (message: any) => void;
    onNotificationError: (err: Error) => void;
  }): Promise<string>;
  unsubscribeFromNotifications(subscriptionId: string): Promise<void>;
  unsubscribeFromAllNotifications(): Promise<void>;
}
