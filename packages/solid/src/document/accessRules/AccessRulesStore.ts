import type {
  DocumentGetterOptions,
  DocumentStoreDependencies,
} from "../DocumentStore";
import { DocumentStore } from "../DocumentStore";
import type { Resource } from "../resource/Resource";
import type { AccessRulesDependencies } from "./AccessRules";
import { AccessRules } from "./AccessRules";

export interface AccessRulesStoreDependencies
  extends DocumentStoreDependencies,
    AccessRulesDependencies {}

export class AccessRulesStore extends DocumentStore<
  AccessRules,
  Resource,
  AccessRulesStoreDependencies
> {
  protected create(
    initializer: Resource,
    documentGetterOptions: DocumentGetterOptions,
  ) {
    return new AccessRules(initializer, {
      ...this.dependencies,
      documentGetterOptions,
    });
  }
}
