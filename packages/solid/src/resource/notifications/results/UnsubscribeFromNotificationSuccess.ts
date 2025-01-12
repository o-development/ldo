import type { ResourceSuccess } from "../../../requester/results/success/SuccessResult";

/**
 * Returned when a notification has been successfully unsubscribed from for a resource
 */
export interface UnsubscribeToNotificationSuccess extends ResourceSuccess {
  type: "unsubscribeFromNotificationSuccess";
  subscriptionId: string;
}
