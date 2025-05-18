/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from "events";
import {
  Unfetched,
  type ConnectedResult,
  type Resource,
  type ResourceError,
  type ResourceEventEmitter,
} from "../../src/index.js";
import type { DatasetChanges } from "@ldo/rdf-utils";
import type { ReadSuccess } from "../../src/results/success/ReadSuccess.js";
import type { UpdateSuccess } from "../../src/results/success/UpdateSuccess.js";
import { vi } from "vitest";

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

  isLoading = vi.fn<() => boolean>();
  isFetched = vi.fn<() => boolean>();
  isUnfetched = vi.fn<() => boolean>();
  isDoingInitialFetch = vi.fn<() => boolean>();
  isPresent = vi.fn<() => boolean | undefined>();
  isAbsent = vi.fn<() => boolean | undefined>();
  isSubscribedToNotifications = vi.fn<() => boolean>();

  read = vi.fn<() => Promise<ReadSuccess<any> | ResourceError<any>>>();
  readIfUnfetched =
    vi.fn<() => Promise<ReadSuccess<any> | ResourceError<any>>>();
  update =
    vi.fn<
      (
        changes: DatasetChanges,
      ) => Promise<UpdateSuccess<any> | ResourceError<any>>
    >();

  subscribeToNotifications =
    vi.fn<
      (options?: {
        onNotification: (message: any) => void;
        onNotificationError: (err: Error) => void;
      }) => Promise<string>
    >();

  unsubscribeFromNotifications = vi.fn<(id: string) => Promise<void>>();
  unsubscribeFromAllNotifications = vi.fn<() => Promise<void>>();
}
