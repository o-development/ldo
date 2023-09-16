import type { SolidLdoDatasetContext } from "../SolidLdoDatasetContext";
import type { AbsentResult } from "../requester/requestResults/AbsentResult";
import type { BinaryResult } from "../requester/requestResults/BinaryResult";
import type { DataResult } from "../requester/requestResults/DataResult";
import { type ErrorResult } from "../requester/requestResults/ErrorResult";
import type {
  CreateResultErrors,
  CreateResultWithoutOverwriteErrors,
} from "../requester/requests/createDataResource";
import type { ReadResultError } from "../requester/requests/readResource";
import type { Container } from "./Container";
import type { Requester } from "../requester/Requester";
import type { CheckRootResultError } from "../requester/requests/checkRootContainer";
import type {
  AccessRule,
  AccessRuleChangeResult,
  AccessRuleFetchError,
  AccessRuleResult,
} from "../requester/requestResults/AccessRule";
import { getAccessRules } from "../requester/requests/getAccessRules";
import { setAccessRules } from "../requester/requests/setAccessRules";

export abstract class Resource {
  // All intance variables
  protected readonly context: SolidLdoDatasetContext;
  readonly uri: string;
  abstract readonly type: string;
  protected abstract readonly requester: Requester;
  protected didInitialFetch: boolean = false;
  protected absent: boolean | undefined;

  constructor(uri: string, context: SolidLdoDatasetContext) {
    this.uri = uri;
    this.context = context;
  }

  // Loading Methods
  isLoading(): boolean {
    return this.requester.isLoading();
  }
  isCreating(): boolean {
    return this.requester.isCreating();
  }
  isUploading(): boolean {
    return this.requester.isUploading();
  }
  isReading(): boolean {
    return this.requester.isReading();
  }
  isUpdating(): boolean {
    return this.requester.isUpdating();
  }
  isDeleting(): boolean {
    return this.requester.isDeletinng();
  }
  isDoingInitialFetch(): boolean {
    return this.isReading() && !this.isFetched();
  }

  // Checkers
  isFetched(): boolean {
    return this.didInitialFetch;
  }
  isUnfetched(): boolean {
    return !this.didInitialFetch;
  }
  isAbsent(): boolean | undefined {
    return this.absent;
  }
  isPresent(): boolean | undefined {
    return this.absent === undefined ? undefined : !this.absent;
  }

  protected parseResult<PossibleErrors extends ErrorResult>(
    result: AbsentResult | BinaryResult | DataResult | PossibleErrors,
  ): this | PossibleErrors {
    switch (result.type) {
      case "error":
        return result;
      case "absent":
        this.didInitialFetch = true;
        this.absent = true;
        return this;
      default:
        this.didInitialFetch = true;
        this.absent = false;
        return this;
    }
  }

  // Read Methods
  async read(): Promise<this | ReadResultError> {
    return this.parseResult(await this.requester.read());
  }
  async readIfUnfetched(): Promise<this | ReadResultError> {
    if (this.didInitialFetch) {
      return this;
    }
    return this.read();
  }

  // Create Methods
  async createAndOverwrite(): Promise<this | CreateResultErrors> {
    return this.parseResult(await this.requester.createDataResource(true));
  }

  async createIfAbsent(): Promise<this | CreateResultWithoutOverwriteErrors> {
    return this.parseResult(await this.requester.createDataResource());
  }

  // Parent Container Methods -- Remember to change for Container
  abstract getRootContainer(): Promise<Container | CheckRootResultError>;

  async getAccessRules(): Promise<AccessRuleResult | AccessRuleFetchError> {
    return getAccessRules({ uri: this.uri, fetch: this.context.fetch });
  }

  async setAccessRules(
    newAccessRules: AccessRule,
  ): Promise<AccessRuleChangeResult | AccessRuleFetchError> {
    return setAccessRules(
      { uri: this.uri, fetch: this.context.fetch },
      newAccessRules,
    );
  }
}
