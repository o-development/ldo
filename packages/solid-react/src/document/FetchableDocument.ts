import EventEmitter from "events";
import { DocumentError } from "./errors/DocumentError";

export interface FetchableDocumentDependencies {
  onDocumentError?: (error: DocumentError) => void;
}

const STATE_UPDATE = "stateUpdate";

export abstract class FetchableDocument extends EventEmitter {
  protected _isLoading: boolean;
  protected _isWriting: boolean;
  protected _didInitialFetch: boolean;
  protected _error?: DocumentError;
  private dependencies;

  constructor(dependencies: FetchableDocumentDependencies) {
    super();
    this._isLoading = false;
    this._isWriting = false;
    this._didInitialFetch = false;
    this.dependencies = dependencies;
  }
  /**
   * ===========================================================================
   * Getters
   * ===========================================================================
   */
  get isLoading() {
    return this._isLoading;
  }

  get didInitialFetch() {
    return this._didInitialFetch;
  }

  get error() {
    return this._error;
  }

  get isWriting() {
    return this._isWriting;
  }

  protected get onDocumentError() {
    return this.dependencies.onDocumentError;
  }

  /**
   * ===========================================================================
   * Methods
   * ===========================================================================
   */
  async read() {
    this._isLoading = true;
    this.emitStateUpdate();
    const documentError = await this.fetchDocument();
    this._isLoading = false;
    this._didInitialFetch = true;
    if (documentError) {
      this.setError(documentError);
    }
    this.emitStateUpdate();
  }

  async reload() {
    return this.read();
  }

  protected abstract fetchDocument(): Promise<DocumentError | undefined>;

  protected beginWrite() {
    this._isWriting = true;
    this.emitStateUpdate();
  }

  protected endWrite(error?: DocumentError) {
    if (error) {
      this.setError(error);
    }
    this._isWriting = false;
    this.emitStateUpdate();
  }

  setError(error: DocumentError) {
    this._error = error;
    this.emitStateUpdate();
    if (this.onDocumentError) {
      this.onDocumentError(error);
    }
  }

  /**
   * Emitter Information
   */
  protected emitStateUpdate() {
    this.emit(STATE_UPDATE);
  }

  onStateUpdate(callback: () => void) {
    this.on(STATE_UPDATE, callback);
  }

  offStateUpdate(callback: () => void) {
    this.off(STATE_UPDATE, callback);
  }
}
