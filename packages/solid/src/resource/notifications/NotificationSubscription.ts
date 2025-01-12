import type { UnexpectedResourceError } from "../../requester/results/error/ErrorResult";
import type { SolidLdoDatasetContext } from "../../SolidLdoDatasetContext";
import type { Resource } from "../Resource";
import type { NotificationMessage } from "./NotificationMessage";
import type {
  NotificationCallbackError,
  UnsupportedNotificationError,
} from "./results/NotificationErrors";
import type { SubscribeToNotificationSuccess } from "./results/SubscribeToNotificationSuccess";
import type { UnsubscribeToNotificationSuccess } from "./results/UnsubscribeFromNotificationSuccess";
import { v4 } from "uuid";

export type SubscribeResult =
  | SubscribeToNotificationSuccess
  | UnsupportedNotificationError
  | UnexpectedResourceError;

export type UnsubscribeResult =
  | UnsubscribeToNotificationSuccess
  | UnexpectedResourceError;

export type OpenResult =
  | { type: "success" }
  | UnsupportedNotificationError
  | UnexpectedResourceError;

export type CloseResult = { type: "success" } | UnexpectedResourceError;

export interface SubscriptionCallbacks {
  onNotification?: (message: NotificationMessage) => void;
  // TODO: make notification errors more specific
  onNotificationError?: (error: Error) => void;
}

/**
 * @internal
 * Abstract class for notification subscription methods.
 */
export abstract class NotificationSubscription {
  protected resource: Resource;
  protected parentSubscription: (message: NotificationMessage) => void;
  protected context: SolidLdoDatasetContext;
  protected subscriptions: Record<string, SubscriptionCallbacks> = {};
  protected isOpen: boolean = false;

  constructor(
    resource: Resource,
    parentSubscription: (message: NotificationMessage) => void,
    context: SolidLdoDatasetContext,
  ) {
    this.resource = resource;
    this.parentSubscription = parentSubscription;
    this.context = context;
  }

  public isSubscribedToNotifications(): boolean {
    return this.isOpen;
  }

  protected onNotification(message: NotificationMessage): void {
    this.parentSubscription(message);
    Object.values(this.subscriptions).forEach(({ onNotification }) => {
      onNotification?.(message);
    });
  }

  protected onNotificationError(message: NotificationCallbackError): void {
    Object.values(this.subscriptions).forEach(({ onNotificationError }) => {
      onNotificationError?.(message);
    });
    if (message.type === "disconnectedNotAttemptingReconnectError") {
      this.isOpen = false;
    }
  }

  async subscribeToNotifications(
    subscriptionCallbacks: SubscriptionCallbacks,
  ): Promise<SubscribeResult> {
    if (!this.isOpen) {
      const openResult = await this.open();
      if (openResult.type !== "success") return openResult;
      this.isOpen = true;
    }
    const subscriptionId = v4();
    this.subscriptions[subscriptionId] = subscriptionCallbacks;
    return {
      isError: false,
      type: "subscribeToNotificationSuccess",
      uri: this.resource.uri,
      subscriptionId,
    };
  }

  async unsubscribeFromNotification(
    subscriptionId: string,
  ): Promise<UnsubscribeResult> {
    delete this.subscriptions[subscriptionId];
    if (Object.keys(this.subscriptions).length === 0) {
      const closeResult = await this.close();
      if (closeResult.type !== "success") return closeResult;
      this.isOpen = false;
    }
    return {
      isError: false,
      type: "unsubscribeFromNotificationSuccess",
      uri: this.resource.uri,
      subscriptionId,
    };
  }

  async unsubscribeFromAllNotifications(): Promise<UnsubscribeResult[]> {
    return Promise.all(
      Object.keys(this.subscriptions).map((id) =>
        this.unsubscribeFromNotification(id),
      ),
    );
  }

  /**
   * @internal
   * Opens the subscription
   */
  protected abstract open(): Promise<OpenResult>;

  /**
   * @internal
   * Closes the subscription
   */
  protected abstract close(): Promise<CloseResult>;
}
