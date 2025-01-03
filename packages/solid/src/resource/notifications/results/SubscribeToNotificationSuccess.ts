import type { ResourceSuccess } from "../../../requester/results/success/SuccessResult";

/**
 * Returned when a notification has been successfully subscribed to for a resource
 */
export interface SubscribeToNotificationSuccess extends ResourceSuccess {
  type: "subscribeToNotificationSuccess";
}
