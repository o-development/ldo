import type { ArrayProxy } from "../arrayProxy/ArrayProxy";
import { isArrayProxy } from "../arrayProxy/isArrayProxy";
import { isSubjectProxy } from "../subjectProxy/isSubjectProxy";
import type { SubjectProxy } from "../subjectProxy/SubjectProxy";
import type { ObjectLike } from "../types";

export function isProxy(
  someObject?: unknown,
): someObject is ArrayProxy | SubjectProxy {
  return isSubjectProxy(someObject) || isArrayProxy(someObject);
}

export function getProxyFromObject(
  object: ObjectLike | ObjectLike[],
): SubjectProxy | ArrayProxy {
  if (!isProxy(object)) {
    throw new Error(`${object} is not a Jsonld Dataset Proxy`);
  }
  return object;
}
