export interface NotificationMessage {
  "@context": string | string[];
  id: string;
  type: "Update";
  object: string;
  published: string;
}
