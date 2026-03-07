import { isSetProxy } from "../setProxy/isSetProxy";
import type { LdSet } from "../setProxy/ldSet/LdSet";
import type { SetProxy } from "../setProxy/SetProxy";
import { isSubjectProxy } from "../subjectProxy/isSubjectProxy";
import type { SubjectProxy } from "../subjectProxy/SubjectProxy";
import type { ObjectLike } from "../types";

export function isProxy(
  someObject?: unknown,
): someObject is SetProxy | SubjectProxy {
  return isSubjectProxy(someObject) || isSetProxy(someObject);
}

export function getProxyFromObject(
  object: ObjectLike | LdSet<ObjectLike>,
): SubjectProxy | SetProxy {
  if (!isProxy(object)) {
    throw new Error(`${object} is not a Jsonld Dataset Proxy`);
  }
  return object;
}
