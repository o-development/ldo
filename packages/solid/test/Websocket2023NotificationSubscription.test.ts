import type { WebSocket, Event, ErrorEvent } from "ws";
import { Websocket2023NotificationSubscription } from "../src/resource/notifications/Websocket2023NotificationSubscription";
import type { SolidLdoDatasetContext } from "../src";
import { Leaf } from "../src";
import type { NotificationChannel } from "@solid-notifications/types";

describe("Websocket2023NotificationSubscription", () => {
  it("returns an error when websockets have an error", async () => {
    const WebSocketMock: WebSocket = {} as WebSocket;
    const onErrorMock = jest.fn();

    const subscription = new Websocket2023NotificationSubscription(
      new Leaf("https://example.com", {
        fetch,
      } as unknown as SolidLdoDatasetContext),
      () => {},
      onErrorMock,
      {} as unknown as SolidLdoDatasetContext,
      () => WebSocketMock,
    );

    const subPromise = subscription.subscribeToWebsocket({
      receiveFrom: "http://example.com",
    } as unknown as NotificationChannel);
    WebSocketMock.onopen?.({} as Event);

    const subscriptionResult = await subPromise;
    expect(subscriptionResult.type).toBe("subscribeToNotificationSuccess");

    WebSocketMock.onerror?.({ error: new Error("Test Error") } as ErrorEvent);

    expect(onErrorMock).toHaveBeenCalled();
  });

  it("returns an error when websockets have an error at the beginning", async () => {
    const WebSocketMock: WebSocket = {} as WebSocket;
    const onErrorMock = jest.fn();

    const subscription = new Websocket2023NotificationSubscription(
      new Leaf("https://example.com", {
        fetch,
      } as unknown as SolidLdoDatasetContext),
      () => {},
      onErrorMock,
      {} as unknown as SolidLdoDatasetContext,
      () => WebSocketMock,
    );

    const subPromise = subscription.subscribeToWebsocket({
      receiveFrom: "http://example.com",
    } as unknown as NotificationChannel);
    WebSocketMock.onerror?.({ error: new Error("Test Error") } as ErrorEvent);
    const subscriptionResult = await subPromise;

    expect(subscriptionResult.type).toBe("unexpectedResourceError");
  });
});