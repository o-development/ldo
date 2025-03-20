import type { ConnectedContext } from "@ldo/connected";
import type { NotificationCallbackError } from "./results/NotificationErrors";
import { v4 } from "uuid";
import type { SolidContainer } from "../resources/SolidContainer";
import type { SolidLeaf } from "../resources/SolidLeaf";
import type { SolidNotificationMessage } from "./SolidNotificationMessage";
import type { SolidConnectedPlugin } from "../SolidConnectedPlugin";

export interface SubscriptionCallbacks {
  onNotification?: (message: SolidNotificationMessage) => void;
  // TODO: make notification errors more specific
  onNotificationError?: (error: Error) => void;
}

/**
 * @internal
 * Abstract class for notification subscription methods.
 */
export abstract class SolidNotificationSubscription {
  protected resource: SolidContainer | SolidLeaf;
  protected parentSubscription: (message: SolidNotificationMessage) => void;
  protected context: ConnectedContext<SolidConnectedPlugin[]>;
  protected subscriptions: Record<string, SubscriptionCallbacks> = {};
  private isOpen: boolean = false;

  constructor(
    resource: SolidContainer | SolidLeaf,
    parentSubscription: (message: SolidNotificationMessage) => void,
    context: ConnectedContext<SolidConnectedPlugin[]>,
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
      this.setIsOpen(true);
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
      this.setIsOpen(false);
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
  protected onNotification(message: SolidNotificationMessage): void {
    this.parentSubscription(message);
    Object.values(this.subscriptions).forEach(({ onNotification }) => {
      onNotification?.(message);
    });
  }

  /**
   * @internal
   * onNotificationError
   */
  protected onNotificationError(
    message: NotificationCallbackError<SolidLeaf | SolidContainer>,
  ): void {
    Object.values(this.subscriptions).forEach(({ onNotificationError }) => {
      onNotificationError?.(message);
    });
    if (message.type === "disconnectedNotAttemptingReconnectError") {
      this.setIsOpen(false);
    }
  }

  /**
   * @internal
   * setIsOpen
   */
  protected setIsOpen(status: boolean) {
    const shouldUpdate = status !== this.isOpen;
    this.isOpen = status;
    if (shouldUpdate) this.resource.emit("update");
  }
}
