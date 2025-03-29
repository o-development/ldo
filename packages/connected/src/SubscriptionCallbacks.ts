export interface SubscriptionCallbacks<NotificationMessage> {
  onNotification?: (message: NotificationMessage) => void;
  // TODO: make notification errors more specific
  onNotificationError?: (error: Error) => void;
}
