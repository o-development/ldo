import { UnexpectedResourceError } from "../../requester/results/error/ErrorResult";
import type {
  CloseSubscriptionResult,
  OpenSubscriptionResult,
} from "./NotificationSubscription";
import { NotificationSubscription } from "./NotificationSubscription";
import { SubscriptionClient } from "@solid-notifications/subscription";
import { WebSocket } from "ws";
import { UnsupportedNotificationError } from "./results/NotificationErrors";
import type { NotificationMessage } from "./NotificationMessage";

const CHANNEL_TYPE =
  "http://www.w3.org/ns/solid/notifications#WebSocketChannel2023";

export class Websocket2023NotificationSubscription extends NotificationSubscription {
  private socket: WebSocket | undefined;

  async open(): Promise<OpenSubscriptionResult> {
    const client = new SubscriptionClient(this.context.fetch);
    try {
      const notificationChannel = await client.subscribe(
        this.resource.uri,
        CHANNEL_TYPE,
      );
      return new Promise<OpenSubscriptionResult>((resolve) => {
        this.socket = new WebSocket(notificationChannel.receiveFrom);
        this.socket.onmessage = (message) => {
          const messageData = message.data.toString();
          // TODO uncompliant Pod error on misformatted message
          this.onNotification(JSON.parse(messageData) as NotificationMessage);
        };
        this.socket.onerror = (err) =>
          resolve(UnexpectedResourceError.fromThrown(this.resource.uri, err));
        this.socket.onopen = () => {
          resolve({
            isError: false,
            type: "subscribeToNotificationSuccess",
            uri: this.resource.uri,
          });
        };
      });
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.startsWith("Discovery did not succeed")
      ) {
        return new UnsupportedNotificationError(this.resource.uri, err.message);
      }
      return UnexpectedResourceError.fromThrown(this.resource.uri, err);
    }
  }

  async close(): Promise<CloseSubscriptionResult> {
    this.socket?.terminate();
    return {
      type: "unsubscribeFromNotificationSuccess",
      isError: false,
      uri: this.resource.uri,
    };
  }
}
