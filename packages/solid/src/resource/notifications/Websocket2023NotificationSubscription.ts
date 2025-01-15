import { UnexpectedResourceError } from "../../requester/results/error/ErrorResult";
import { NotificationSubscription } from "./NotificationSubscription";
import { SubscriptionClient } from "@solid-notifications/subscription";
import { WebSocket } from "ws";
import {
  DisconnectedAttemptingReconnectError,
  DisconnectedNotAttemptingReconnectError,
  UnsupportedNotificationError,
} from "./results/NotificationErrors";
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

  // Reconnection data
  // How often we should attempt a reconnection
  private reconnectInterval = 5000;
  // How many attempts have already been tried for a reconnection
  private reconnectAttempts = 0;
  // Whether or not the socket was manually closes
  private isManualClose = false;
  // Maximum number of attempts to reconnect
  private maxReconnectAttempts = 6;

  constructor(
    resource: Resource,
    parentSubscription: (message: NotificationMessage) => void,
    context: SolidLdoDatasetContext,
    createWebsocket?: (address: string) => WebSocket,
  ) {
    super(resource, parentSubscription, context);
    this.createWebsocket = createWebsocket ?? createWebsocketDefault;
  }

  async open(): Promise<void> {
    try {
      const notificationChannel = await this.discoverNotificationChannel();
      await this.subscribeToWebsocket(notificationChannel);
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.startsWith("Discovery did not succeed")
      ) {
        this.onNotificationError(
          new UnsupportedNotificationError(this.resource.uri, err.message),
        );
      } else {
        this.onNotificationError(
          UnexpectedResourceError.fromThrown(this.resource.uri, err),
        );
      }
      this.onClose();
    }
  }

  public async discoverNotificationChannel(): Promise<NotificationChannel> {
    const client = new SubscriptionClient(this.context.fetch);
    return await client.subscribe(
      this.resource.uri,
      CHANNEL_TYPE as ChannelType,
    );
  }

  public async subscribeToWebsocket(
    notificationChannel: NotificationChannel,
  ): Promise<void> {
    this.socket = this.createWebsocket(
      notificationChannel.receiveFrom as string,
    );

    this.socket.onopen = () => {
      this.reconnectAttempts = 0; // Reset attempts on successful connection
      this.isManualClose = false; // Reset manual close flag
    };

    this.socket.onmessage = (message) => {
      const messageData = message.data.toString();
      // TODO uncompliant Pod error on misformatted message
      this.onNotification(JSON.parse(messageData) as NotificationMessage);
    };

    this.socket.onclose = this.onClose.bind(this);

    this.socket.onerror = (err) => {
      this.onNotificationError(
        new UnexpectedResourceError(this.resource.uri, err.error),
      );
    };
    return;
  }

  private onClose() {
    if (!this.isManualClose) {
      // Attempt to reconnect only if the disconnection was unintentional
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          this.open();
        }, this.reconnectInterval);
        this.onNotificationError(
          new DisconnectedAttemptingReconnectError(
            this.resource.uri,
            `Attempting to reconnect to Websocket for ${this.resource.uri}.`,
          ),
        );
      } else {
        this.onNotificationError(
          new DisconnectedNotAttemptingReconnectError(
            this.resource.uri,
            `Lost connection to websocket for ${this.resource.uri}.`,
          ),
        );
      }
    }
  }

  protected async close(): Promise<void> {
    this.socket?.terminate();
  }
}

function createWebsocketDefault(address: string) {
  return new WebSocket(address);
}
