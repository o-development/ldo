import { DocumentStore, DocumentStoreDependencies } from "../DocumentStore";
import { Resource } from "../resource/Resource";
import { AccessRules, AccessRulesDependencies } from "./AccessRules";

export interface AccessRulesStoreDependencies
  extends DocumentStoreDependencies,
    AccessRulesDependencies {}

export class AccessRulesStore extends DocumentStore<
  AccessRules,
  Resource,
  AccessRulesStoreDependencies
> {
  create(initializer: Resource) {
    return new AccessRules(initializer, this.dependencies);
  }
}
