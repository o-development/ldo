import type { ResourceSuccess, SuccessResult } from "./SuccessResult";

export interface ReadSuccess extends ResourceSuccess {
  recalledFromMemory: boolean;
}

export interface BinaryReadSuccess extends ReadSuccess {
  type: "binaryReadSuccess";
  blob: Blob;
  mimeType: string;
}

export interface DataReadSuccess extends ReadSuccess {
  type: "dataReadSuccess";
}

export interface ContainerReadSuccess extends ReadSuccess {
  type: "containerReadSuccess";
  isRootContainer: boolean;
}

export interface AbsentReadSuccess extends ReadSuccess {
  type: "absentReadSuccess";
}

export function isReadSuccess(result: SuccessResult): result is ReadSuccess {
  return (
    result.type === "binaryReadSuccess" ||
    result.type === "dataReadSuccess" ||
    result.type === "absentReadSuccess" ||
    result.type === "containerReadSuccess"
  );
}
