import { ResourceError } from "./ErrorResult";

export class AccessRuleFetchError extends ResourceError {
  readonly type = "accessRuleFetchError" as const;

  constructor(uri: string, message?: string) {
    super(uri, message || `${uri} had trouble fetching access rules.`);
  }
}
