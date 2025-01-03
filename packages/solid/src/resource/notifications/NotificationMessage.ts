/**
 * A message sent from the Pod as a notification
 */
export interface NotificationMessage {
  "@context": string | string[];
  id: string;
  type: "Update" | "Delete" | "Remove" | "Add";
  object: string;
  published: string;
}
