import type { DocumentGetterOptions } from "../DocumentStore";
import { DocumentStore } from "../DocumentStore";
import type { Resource } from "../resource/Resource";
import { AccessRules } from "./AccessRules";

export class AccessRulesStore extends DocumentStore<AccessRules, Resource> {
  protected create(
    initializer: Resource,
    documentGetterOptions?: DocumentGetterOptions,
  ) {
    return new AccessRules(initializer, this.context, documentGetterOptions);
  }
}
