import { ContainerRequester } from "../requester/ContainerRequester";
import { UnexpectedError } from "../requester/requestResults/ErrorResult";
import type { CheckRootResultError } from "../requester/requests/checkRootContainer";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import { getParentUri } from "../util/rdfUtils";
import type { ContainerUri } from "../util/uriTypes";
import { Resource } from "./Resource";

export class Container extends Resource {
  protected requester: ContainerRequester;
  protected rootContainer: boolean | undefined;
  readonly type = "container" as const;

  constructor(uri: ContainerUri, context: SolidLdoDatasetContext) {
    super(uri, context);
    this.requester = new ContainerRequester(uri, context);
  }

  isRootContainer(): boolean | undefined {
    return this.rootContainer;
  }

  getParentContainer(): Promise<Container | undefined> {
    throw new Error("Method not implemented.");
  }

  async getRootContainer(): Promise<Container | CheckRootResultError> {
    if (this.rootContainer === undefined) {
      const rootContainerResult = await this.requester.isRootContainer();
      if (typeof rootContainerResult !== "boolean") {
        return rootContainerResult;
      }
      this.rootContainer = rootContainerResult;
    }
    if (this.rootContainer) {
      return this;
    }
    const parentUri = getParentUri(this.uri);
    if (!parentUri) {
      return new UnexpectedError(
        this.uri,
        new Error("Resource does not have a root container"),
      );
    }
    return this.context.resourceStore.get(parentUri);
  }

  getMimeType(): string {
    throw new Error("Method not implemented.");
  }
}
