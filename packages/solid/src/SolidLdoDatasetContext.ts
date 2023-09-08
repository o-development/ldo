// import type TypedEmitter from "typed-emitter";
import type { SolidLdoDataset } from "./SolidLdoDataset";
// import type { DocumentError } from "./document/errors/DocumentError";

// export type OnDocumentErrorCallback = (error: DocumentError) => void;

// export type DocumentEventEmitter = TypedEmitter<{
//   documentError: OnDocumentErrorCallback;
// }>;

export interface SolidLdoDatasetContext {
  solidLdoDataset: SolidLdoDataset;
  // documentEventEmitter: DocumentEventEmitter;
  fetch: typeof fetch;
}
