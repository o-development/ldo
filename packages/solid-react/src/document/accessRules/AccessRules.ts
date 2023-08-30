import {
  universalAccess,
  AccessModes as IAccessModes,
} from "@inrupt/solid-client";
import {
  FetchableDocument,
  FetchableDocumentDependencies,
} from "../FetchableDocument";
import { Resource } from "../resource/Resource";
import { DocumentError } from "../errors/DocumentError";

export type AccessModes = IAccessModes;

export interface AccessRulesDependencies extends FetchableDocumentDependencies {
  fetch: typeof fetch;
}

export class AccessRules extends FetchableDocument {
  readonly resource: Resource;
  private _publicAccess: IAccessModes | null;
  private _agentAccess: Record<string, IAccessModes> | null;
  private dependencies0;

  constructor(resource: Resource, dependencies: AccessRulesDependencies) {
    super(dependencies);
    this._publicAccess = null;
    this._agentAccess = null;
    this.dependencies0 = dependencies;
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

  protected get fetch() {
    return this.dependencies0.fetch;
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
          fetch: this.fetch,
        }),
        universalAccess.getAgentAccessAll(this.resource.uri, {
          fetch: this.fetch,
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
