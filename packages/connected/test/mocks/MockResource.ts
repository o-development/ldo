/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from "events";
import type { ResourceError } from "../../src.js";
import type { ResourceError } from "../../src.js";
import type { DatasetChanges } from "@ldo/rdf-utils";
import type { ReadSuccess } from "../../src/results/success/ReadSuccess.js";
import type { UpdateSuccess } from "../../src/results/success/UpdateSuccess.js";

export class MockResource
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

  isLoading = jest.fn<boolean, []>();
  isFetched = jest.fn<boolean, []>();
  isUnfetched = jest.fn<boolean, []>();
  isDoingInitialFetch = jest.fn<boolean, []>();
  isPresent = jest.fn<boolean | undefined, []>();
  isAbsent = jest.fn<boolean | undefined, []>();
  isSubscribedToNotifications = jest.fn<boolean, []>();

  read = jest.fn<Promise<ReadSuccess<any> | ResourceError<any>>, []>();
  readIfUnfetched = jest.fn<
    Promise<ReadSuccess<any> | ResourceError<any>>,
    []
  >();
  update = jest.fn<
    Promise<UpdateSuccess<any> | ResourceError<any>>,
    [DatasetChanges]
  >();

  subscribeToNotifications = jest.fn<
    Promise<string>,
    [
      {
        onNotification: (message: any) => void;
        onNotificationError: (err: Error) => void;
      }?,
    ]
  >();

  unsubscribeFromNotifications = jest.fn<Promise<void>, [string]>();
  unsubscribeFromAllNotifications = jest.fn<Promise<void>, []>();
}
