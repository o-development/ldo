/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from "events";
import type { ResourceError } from "../src";
import {
  Unfetched,
  type ConnectedResult,
  type Resource,
  type ResourceEventEmitter,
} from "../src";
import type { DatasetChanges } from "@ldo/rdf-utils";
import type { ReadSuccess } from "../src/results/success/ReadSuccess";
import type { UpdateSuccess } from "../src/results/success/UpdateSuccess";

export class MockResouce
  extends (EventEmitter as new () => ResourceEventEmitter)
  implements Resource
{
  isError = false as const;
  uri: string;
  type = "mock" as const;
  status: ConnectedResult;

  constructor(uri: string) {
    super();
    this.uri = uri;
    this.status = new Unfetched(this);
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
  isPresent(): boolean | undefined {
    throw new Error("Method not implemented.");
  }
  isAbsent(): boolean | undefined {
    throw new Error("Method not implemented.");
  }
  isSubscribedToNotifications(): boolean {
    throw new Error("Method not implemented.");
  }
  read(): Promise<ReadSuccess<any> | ResourceError<any>> {
    throw new Error("Method not implemented.");
  }
  readIfAbsent(): Promise<ReadSuccess<any> | ResourceError<any>> {
    throw new Error("Method not implemented.");
  }
  update(
    _datasetChanges: DatasetChanges,
  ): Promise<UpdateSuccess<any> | ResourceError<any>> {
    throw new Error("Method not implemented.");
  }
  subscribeToNotifications(_callbacks?: {
    onNotification: (message: any) => void;
    onNotificationError: (err: Error) => void;
  }): Promise<string> {
    throw new Error("Method not implemented.");
  }
  unsubscribeFromNotifications(_subscriptionId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  unsubscribeFromAllNotifications(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
