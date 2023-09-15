import type { Requester } from "../requester/Requester";
import type { ContainerUri } from "../util/uriTypes";
import { Resource } from "./Resource";

export class Container extends Resource {
  protected requester: Requester;
  getParentContainer(): Promise<Container | undefined> {
    throw new Error("Method not implemented.");
  }
  getRootContainer(): Promise<Container> {
    throw new Error("Method not implemented.");
  }
  getMimeType(): string {
    throw new Error("Method not implemented.");
  }
  readonly uri: ContainerUri;
  private rootContainer: boolean | undefined;

  isRootContainer(): boolean | undefined {
    return this.rootContainer;
  }
}
