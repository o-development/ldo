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
import type { Resource } from "../Resource";
import type { SolidLdoDatasetContext } from "../../SolidLdoDatasetContext";
import type {
  ChannelType,
  NotificationChannel,
} from "@solid-notifications/types";

const CHANNEL_TYPE =
  "http://www.w3.org/ns/solid/notifications#WebSocketChannel2023";

export class Websocket2023NotificationSubscription extends NotificationSubscription {
  private socket: WebSocket | undefined;
  private createWebsocket: (address: string) => WebSocket;

  constructor(
    resource: Resource,
    onNotification: (message: NotificationMessage) => void,
    onError: ((err: Error) => void) | undefined,
    context: SolidLdoDatasetContext,
    createWebsocket?: (address: string) => WebSocket,
  ) {
    super(resource, onNotification, onError, context);
    this.createWebsocket = createWebsocket ?? createWebsocketDefault;
  }

  async open(): Promise<OpenSubscriptionResult> {
    try {
      const notificationChannel = await this.discoverNotificationChannel();
      return this.subscribeToWebsocket(notificationChannel);
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

  async discoverNotificationChannel(): Promise<NotificationChannel> {
    const client = new SubscriptionClient(this.context.fetch);
    return await client.subscribe(
      this.resource.uri,
      CHANNEL_TYPE as ChannelType,
    );
  }

  async subscribeToWebsocket(
    notificationChannel: NotificationChannel,
  ): Promise<OpenSubscriptionResult> {
    return new Promise<OpenSubscriptionResult>((resolve) => {
      let didResolve = false;
      this.socket = this.createWebsocket(
        notificationChannel.receiveFrom as string,
      );
      this.socket.onmessage = (message) => {
        const messageData = message.data.toString();
        // TODO uncompliant Pod error on misformatted message
        this.onNotification(JSON.parse(messageData) as NotificationMessage);
      };
      this.socket.onerror = (err) => {
        if (!didResolve) {
          resolve(UnexpectedResourceError.fromThrown(this.resource.uri, err));
        } else {
          this.onError?.(err.error);
        }
      };
      this.socket.onopen = () => {
        didResolve = true;
        resolve({
          isError: false,
          type: "subscribeToNotificationSuccess",
          uri: this.resource.uri,
        });
      };
    });
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

function createWebsocketDefault(address: string) {
  return new WebSocket(address);
}
