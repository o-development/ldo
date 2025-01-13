import type { SolidLdoDatasetContext } from "../../SolidLdoDatasetContext";
import type { Resource } from "../Resource";
import type { NotificationMessage } from "./NotificationMessage";
import type { NotificationCallbackError } from "./results/NotificationErrors";
import { v4 } from "uuid";

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

  /**
   * ===========================================================================
   * PUBLIC
   * ===========================================================================
   */

  /**
   * @internal
   * subscribeToNotifications
   */
  async subscribeToNotifications(
    subscriptionCallbacks?: SubscriptionCallbacks,
  ): Promise<string> {
    const subscriptionId = v4();
    this.subscriptions[subscriptionId] = subscriptionCallbacks ?? {};
    if (!this.isOpen) {
      await this.open();
      this.isOpen = true;
    }
    return subscriptionId;
  }

  /**
   * @internal
   * unsubscribeFromNotification
   */
  async unsubscribeFromNotification(subscriptionId: string): Promise<void> {
    if (
      !!this.subscriptions[subscriptionId] &&
      Object.keys(this.subscriptions).length === 1
    ) {
      await this.close();
      this.isOpen = false;
    }
    delete this.subscriptions[subscriptionId];
  }

  /**
   * @internal
   * unsubscribeFromAllNotifications
   */
  async unsubscribeFromAllNotifications(): Promise<void> {
    await Promise.all(
      Object.keys(this.subscriptions).map((id) =>
        this.unsubscribeFromNotification(id),
      ),
    );
  }

  /**
   * ===========================================================================
   * HELPERS
   * ===========================================================================
   */

  /**
   * @internal
   * Opens the subscription
   */
  protected abstract open(): Promise<void>;

  /**
   * @internal
   * Closes the subscription
   */
  protected abstract close(): Promise<void>;

  /**
   * ===========================================================================
   * CALLBACKS
   * ===========================================================================
   */

  /**
   * @internal
   * onNotification
   */
  protected onNotification(message: NotificationMessage): void {
    this.parentSubscription(message);
    Object.values(this.subscriptions).forEach(({ onNotification }) => {
      onNotification?.(message);
    });
  }

  /**
   * @internal
   * onNotificationError
   */
  protected onNotificationError(message: NotificationCallbackError): void {
    Object.values(this.subscriptions).forEach(({ onNotificationError }) => {
      onNotificationError?.(message);
    });
    if (message.type === "disconnectedNotAttemptingReconnectError") {
      this.isOpen = false;
    }
  }
}
