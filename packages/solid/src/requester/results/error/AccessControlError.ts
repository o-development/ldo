/* istanbul ignore file */
import { ResourceError } from "./ErrorResult";

/**
 * An error: Could not fetch access rules
 */
export class AccessRuleFetchError extends ResourceError {
  readonly type = "accessRuleFetchError" as const;

  /**
   * @param uri - The uri of the resource for which access rules couldn't be
   * fetched
   * @param message - A custom message for the error
   */
  constructor(uri: string, message?: string) {
    super(uri, message || `${uri} had trouble fetching access rules.`);
  }
}
