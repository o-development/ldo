import type { QuadMatch } from "@ldo/rdf-utils";
import type { ProxyContext } from "../ProxyContext";
import type { RawObject, RawValue } from "../util/RawObject";
import type { ObjectSetProxyQuadMatch } from "./ObjectSetProxy";
import { ObjectSetProxy } from "./ObjectSetProxy";
import type { SubjectSetProxyQuadMatch } from "./SubjectSetProxy";
import { SubjectSetProxy } from "./SubjectSetProxy";
import type { WildcardObjectSetProxyQuadMatch } from "./WildcardObjectSetProxy";
import { WildcardObjectSetProxy } from "./WildcardObjectSetProxy";
import type { WildcardSubjectSetProxyQuadMatch } from "./WildcardSubjectSetProxy";
import { WildcardSubjectSetProxy } from "./WildcardSubjectSetProxy";
import type { SetProxy } from "./SetProxy";

export function createNewSetProxy<T extends NonNullable<RawValue>>(
  quadMatch: QuadMatch,
  isSubjectOriented: boolean,
  proxyContext: ProxyContext,
  isLangSet?: boolean,
): SetProxy<T> {
  if (!isSubjectOriented) {
    if (quadMatch[0] && quadMatch[1]) {
      return new ObjectSetProxy<T>(
        proxyContext,
        quadMatch as ObjectSetProxyQuadMatch,
        isLangSet,
      );
    } else {
      return new WildcardObjectSetProxy<T>(
        proxyContext,
        quadMatch as WildcardObjectSetProxyQuadMatch,
        isLangSet,
      );
    }
  } else {
    if (quadMatch[1] && quadMatch[2]) {
      return new SubjectSetProxy<T & RawObject>(
        proxyContext,
        quadMatch as SubjectSetProxyQuadMatch,
      );
    } else {
      return new WildcardSubjectSetProxy<T & RawObject>(
        proxyContext,
        quadMatch as WildcardSubjectSetProxyQuadMatch,
      );
    }
  }
}
