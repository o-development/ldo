import { ResourceSuccess } from "./SuccessResult";

export abstract class ReadSuccess extends ResourceSuccess {
  recalledFromMemory: boolean;
  constructor(uri: string, recalledFromMemory: boolean) {
    super(uri);
    this.recalledFromMemory = recalledFromMemory;
  }
}

export class BinaryReadSuccess extends ReadSuccess {
  readonly type = "binaryReadSuccess" as const;
  readonly blob: Blob;
  readonly mimeType: string;

  constructor(
    uri: string,
    recalledFromMemory: boolean,
    blob: Blob,
    mimeType: string,
  ) {
    super(uri, recalledFromMemory);
    this.blob = blob;
    this.mimeType = mimeType;
  }
}

export class DataReadSuccess extends ReadSuccess {
  readonly type = "dataReadSuccess" as const;

  constructor(uri: string, recalledFromMemory: boolean) {
    super(uri, recalledFromMemory);
  }
}

export class ContainerReadSuccess extends ReadSuccess {
  readonly type = "containerReadSuccess" as const;
  readonly isRootContainer: boolean;

  constructor(
    uri: string,
    recalledFromMemory: boolean,
    isRootContainer: boolean,
  ) {
    super(uri, recalledFromMemory);
    this.isRootContainer = isRootContainer;
  }
}

export class AbsentReadSuccess extends ReadSuccess {
  readonly type = "absentReadSuccess" as const;

  constructor(uri: string, recalledFromMemory: boolean) {
    super(uri, recalledFromMemory);
  }
}
