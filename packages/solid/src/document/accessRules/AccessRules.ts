import type { AccessModes as IAccessModes } from "@inrupt/solid-client";
import { universalAccess } from "@inrupt/solid-client";
import { FetchableDocument } from "../FetchableDocument";
import type { Resource } from "../resource/Resource";
import { DocumentError } from "../errors/DocumentError";
import type { SolidLdoDatasetContext } from "../../SolidLdoDatasetContext";
import type { DocumentGetterOptions } from "../DocumentStore";

export type AccessModes = IAccessModes;

export class AccessRules extends FetchableDocument {
  readonly resource: Resource;
  private _publicAccess: IAccessModes | null;
  private _agentAccess: Record<string, IAccessModes> | null;

  constructor(
    resource: Resource,
    context: SolidLdoDatasetContext,
    documentGetterOptions?: DocumentGetterOptions,
  ) {
    super(context, documentGetterOptions);
    this._publicAccess = null;
    this._agentAccess = null;
    this.resource = resource;
  }

  /**
   * ===========================================================================
   * Getters
   * ===========================================================================
   */
  get publicAccess() {
    return this._publicAccess;
  }

  get agentAccess() {
    return this._agentAccess;
  }

  /**
   * ===========================================================================
   * Methods
   * ===========================================================================
   */
  protected async fetchDocument() {
    try {
      const [publicAccess, agentAccess] = await Promise.all([
        universalAccess.getPublicAccess(this.resource.uri, {
          fetch: this.context.fetch,
        }),
        universalAccess.getAgentAccessAll(this.resource.uri, {
          fetch: this.context.fetch,
        }),
      ]);
      this._publicAccess = publicAccess || {
        read: false,
        write: false,
        append: false,
        controlRead: false,
        controlWrite: false,
      };
      this._agentAccess = agentAccess || {};
      return undefined;
    } catch (err: unknown) {
      if (typeof err === "object" && (err as Error).message) {
        this.setError(new DocumentError(this, (err as Error).message));
      }
      this.setError(new DocumentError(this, "Error Fetching Access Rules"));
    }
  }
}
