import { ErrorResult } from "@ldo/connected";

export class NoNextGraphStoreError extends ErrorResult {
  type = "noNextGraphStore" as const;
  constructor(message?: string) {
    super(message ?? "No NextGraph store was provided.");
  }
}
