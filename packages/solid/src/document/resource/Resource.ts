import type { SolidLdoDatasetContext } from "../../SolidLdoDatasetContext";
import type { DocumentGetterOptions } from "../DocumentStore";
import { FetchableDocument } from "../FetchableDocument";
import { DocumentFetchError } from "../errors/DocumentFetchError";
import type { ContainerResource } from "./dataResource/containerResource/ContainerResource";

export abstract class Resource extends FetchableDocument {
  public readonly uri: string;

  constructor(
    uri: string,
    context: SolidLdoDatasetContext,
    documentGetterOptions?: DocumentGetterOptions,
  ) {
    super(context, documentGetterOptions);
    this.uri = uri;
  }

  /**
   * ===========================================================================
   * Getters
   * ===========================================================================
   */
  get accessRules() {
    return this.context.accessRulesStore.get(this);
  }

  get parentContainer(): ContainerResource | undefined {
    return this.context.containerResourceStore.getContainerForResouce(this);
  }

  get ["@id"]() {
    return this.uri;
  }

  /**
   * ===========================================================================
   * Methods
   * ===========================================================================
   */
  async delete() {
    this.beginWrite();
    const response = await this.context.fetch(this.uri, {
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
        `Could not delete ${this.uri}`,
      ),
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
