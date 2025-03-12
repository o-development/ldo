import type {
  ConnectedResult,
  Resource,
  ResourceResult,
  SubscriptionCallbacks,
} from "@ldo/connected";
import type { SolidContainerUri, SolidLeafUri } from "../types";

export class SolidResource
  implements Resource<SolidLeafUri | SolidContainerUri>
{
  uri: SolidLeafUri | SolidContainerUri;
  type: string;
  status: ConnectedResult;
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
  read(): Promise<ResourceResult<this>> {
    throw new Error("Method not implemented.");
  }
  readIfAbsent(): Promise<ResourceResult<this>> {
    throw new Error("Method not implemented.");
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
  addListener<E extends "update" | "notification">(
    event: E,
    listener: { update: () => void; notification: () => void }[E],
  ): this {
    throw new Error("Method not implemented.");
  }
  on<E extends "update" | "notification">(
    event: E,
    listener: { update: () => void; notification: () => void }[E],
  ): this {
    throw new Error("Method not implemented.");
  }
  once<E extends "update" | "notification">(
    event: E,
    listener: { update: () => void; notification: () => void }[E],
  ): this {
    throw new Error("Method not implemented.");
  }
  prependListener<E extends "update" | "notification">(
    event: E,
    listener: { update: () => void; notification: () => void }[E],
  ): this {
    throw new Error("Method not implemented.");
  }
  prependOnceListener<E extends "update" | "notification">(
    event: E,
    listener: { update: () => void; notification: () => void }[E],
  ): this {
    throw new Error("Method not implemented.");
  }
  off<E extends "update" | "notification">(
    event: E,
    listener: { update: () => void; notification: () => void }[E],
  ): this {
    throw new Error("Method not implemented.");
  }
  removeAllListeners<E extends "update" | "notification">(
    event?: E | undefined,
  ): this {
    throw new Error("Method not implemented.");
  }
  removeListener<E extends "update" | "notification">(
    event: E,
    listener: { update: () => void; notification: () => void }[E],
  ): this {
    throw new Error("Method not implemented.");
  }
  emit<E extends "update" | "notification">(
    event: E,
    ...args: Parameters<{ update: () => void; notification: () => void }[E]>
  ): boolean {
    throw new Error("Method not implemented.");
  }
  eventNames(): (string | symbol)[] {
    throw new Error("Method not implemented.");
  }
  rawListeners<E extends "update" | "notification">(
    event: E,
  ): { update: () => void; notification: () => void }[E][] {
    throw new Error("Method not implemented.");
  }
  listeners<E extends "update" | "notification">(
    event: E,
  ): { update: () => void; notification: () => void }[E][] {
    throw new Error("Method not implemented.");
  }
  listenerCount<E extends "update" | "notification">(event: E): number {
    throw new Error("Method not implemented.");
  }
  getMaxListeners(): number {
    throw new Error("Method not implemented.");
  }
  setMaxListeners(maxListeners: number): this {
    throw new Error("Method not implemented.");
  }
}
