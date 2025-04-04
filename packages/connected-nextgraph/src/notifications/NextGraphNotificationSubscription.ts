import { NotificationSubscription } from "@ldo/connected";
import type { NextGraphConnectedPlugin } from "../NextGraphConnectedPlugin";
import type { NextGraphNotificationMessage } from "./NextGraphNotificationMessage";
import ng from "nextgraph";

export class NextGraphNotificationSubscription extends NotificationSubscription<
  NextGraphConnectedPlugin,
  NextGraphNotificationMessage
> {
  private unsub: (() => void) | undefined;

  protected async open(): Promise<void> {
    console.log("THIS WAS OPENED AND IT SHOULDNT BE");
    this.unsub = await ng.doc_subscribe(
      this.resource.uri,
      this.context.nextgraph.sessionId,
      this.onNotification.bind(this),
    );
  }

  protected async close(): Promise<void> {
    this.unsub?.();
    this.unsub = undefined;
  }
}
