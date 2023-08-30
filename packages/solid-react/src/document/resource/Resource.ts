import {
  FetchableDocument,
  FetchableDocumentDependencies,
} from "../FetchableDocument";
import { AccessRulesStore } from "../accessRules/AccessRulesStore";
import { DocumentFetchError } from "../errors/DocumentFetchError";
import { ContainerResource } from "./dataResource/containerResource/ContainerResource";
import { ContainerResourceStore } from "./dataResource/containerResource/ContainerResourceStore";

export interface ResourceDependencies extends FetchableDocumentDependencies {
  fetch: typeof fetch;
  accessRulesStore: AccessRulesStore;
  containerResourceStore: ContainerResourceStore;
}

export abstract class Resource extends FetchableDocument {
  public readonly uri: string;
  private dependencies1;

  constructor(uri: string, dependencies: ResourceDependencies) {
    super(dependencies);
    this.uri = uri;
    this.dependencies1 = dependencies;
  }

  /**
   * ===========================================================================
   * Getters
   * ===========================================================================
   */
  get accessRules() {
    return this.accessRulesStore.get(this);
  }

  get parentContainer(): ContainerResource | undefined {
    return this.containerResourceStore.getContainerForResouce(this);
  }

  get ["@id"]() {
    return this.uri;
  }

  protected get fetch() {
    return this.dependencies1.fetch;
  }

  protected get accessRulesStore() {
    return this.dependencies1.accessRulesStore;
  }

  protected get containerResourceStore() {
    return this.dependencies1.containerResourceStore;
  }

  /**
   * ===========================================================================
   * Methods
   * ===========================================================================
   */
  async delete() {
    this.beginWrite();
    const response = await this.fetch(this.uri, {
      method: "DELETE",
    });
    if (response.status >= 200 && response.status < 300) {
      this.endWrite();
      this.parentContainer?.removeContainedResources(this);
      return;
    }
    this.endWrite(
      new DocumentFetchError(
        this,
        response.status,
        `Could not delete ${this.uri}`
      )
    );
  }

  /**
   * ===========================================================================
   * Static Methods
   * ===========================================================================
   */
  /**
   * Takes in a URL and will normalize it to the document it's fetching
   */
  static normalizeUri(uri: string): string {
    const [strippedHashUri] = uri.split("#");
    return strippedHashUri;
  }
}
