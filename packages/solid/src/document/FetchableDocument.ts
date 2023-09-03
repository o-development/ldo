import EventEmitter from "events";
import type { DocumentError } from "./errors/DocumentError";
import type { DocumentGetterOptions } from "./DocumentStore";
import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import type TypedEventEmitter from "typed-emitter";

export type FetchableDocumentEventEmitter = TypedEventEmitter<{
  stateUpdate: () => void;
}>;

export abstract class FetchableDocument extends (EventEmitter as new () => FetchableDocumentEventEmitter) {
  protected _isLoading: boolean;
  protected _isWriting: boolean;
  protected _didInitialFetch: boolean;
  protected _error?: DocumentError;
  protected context: SolidLdoDatasetContext;

  constructor(
    context: SolidLdoDatasetContext,
    documentGetterOptions?: DocumentGetterOptions,
  ) {
    super();
    this._isLoading = false;
    this._isWriting = false;
    this._didInitialFetch = false;
    this.context = context;
    // Trigger load if autoload is true
    if (documentGetterOptions?.autoLoad) {
      this._isLoading = true;
      this.read();
    }
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

  get isLoadingInitial() {
    return this._isLoading && !this._didInitialFetch;
  }

  get isReloading() {
    return this._isLoading && this._didInitialFetch;
  }

  get error() {
    return this._error;
  }

  get isWriting() {
    return this._isWriting;
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
    this.context.documentEventEmitter.emit("documentError", error);
  }

  /**
   * Emitter Information
   */
  protected emitStateUpdate() {
    this.emit("stateUpdate");
  }

  onStateUpdate(callback: () => void) {
    this.on("stateUpdate", callback);
  }

  offStateUpdate(callback: () => void) {
    this.off("stateUpdate", callback);
  }
}
