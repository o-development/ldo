import { namedNode } from "@rdfjs/data-model";
import { getSubjectProxyFromObject } from "../subjectProxy/isSubjectProxy";
import type { ObjectLike } from "../types";
import { _getUnderlyingNode, _proxyContext } from "../types";
import { createLanguageMapProxy } from "./languageMapProxy";

/**
 * -----------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------
 */

export type LanguageMap = {
  "@none"?: string;
  [language: string]: string | undefined;
};

export type LanguageSetMap = {
  "@none"?: LanguageSet;
  [language: string]: LanguageSet | undefined;
};

export type LanguageSet = Set<string>;

export type LanguageOfConditionalReturn<
  SubjectObject extends ObjectLike,
  Key extends keyof SubjectObject,
> = NonNullable<SubjectObject[Key]> extends Array<unknown>
  ? LanguageSetMap
  : LanguageMap;

/**
 * -----------------------------------------------------------------------------
 * Functions
 * -----------------------------------------------------------------------------
 */

/**
 *
 * @param subject
 * @param predicate
 * @returns
 */
export function languagesOf<
  SubjectObject extends ObjectLike,
  Key extends keyof SubjectObject,
>(
  subjectObject: SubjectObject,
  key: Key,
): LanguageOfConditionalReturn<SubjectObject, Key> {
  const proxy = getSubjectProxyFromObject(subjectObject);
  const proxyContext = proxy[_proxyContext];
  const subject = proxy[_getUnderlyingNode];
  const rdfTypes = proxyContext.getRdfType(subject);
  const predicate = namedNode(
    proxyContext.contextUtil.keyToIri(key as string, rdfTypes),
  );
  return createLanguageMapProxy<LanguageMap>(
    subject,
    predicate,
    proxyContext,
    proxyContext.contextUtil.isArray(key as string, rdfTypes),
  ) as LanguageOfConditionalReturn<SubjectObject, Key>;
}
