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
import type { SetProxy } from "./setProxy";

// export function createNewSetProxy<T extends NonNullable<RawValue>>(
//   quadMatch: ObjectSetProxyQuadMatch,
//   isSubjectOriented: false,
//   proxyContext: ProxyContext,
// ): ObjectSetProxy<T>;
// export function createNewSetProxy<T extends RawObject>(
//   quadMatch: SubjectSetProxyQuadMatch,
//   isSubjectOriented: true,
//   proxyContext: ProxyContext,
// ): SubjectSetProxy<T>;
// export function createNewSetProxy<T extends NonNullable<RawValue>>(
//   quadMatch: WildcardObjectSetProxyQuadMatch,
//   isSubjectOriented: false,
//   proxyContext: ProxyContext,
// ): WildcardObjectSetProxy<T>;
// export function createNewSetProxy<T extends RawObject>(
//   quadMatch: WildcardSubjectSetProxyQuadMatch,
//   isSubjectOriented: true,
//   proxyContext: ProxyContext,
// ): WildcardSubjectSetProxy<T>;
export function createNewSetProxy<T extends NonNullable<RawValue>>(
  quadMatch: QuadMatch,
  isSubjectOriented: boolean,
  proxyContext: ProxyContext,
): SetProxy<T> {
  if (!isSubjectOriented) {
    if (quadMatch[0] && quadMatch[1]) {
      return new ObjectSetProxy<T>(
        proxyContext,
        quadMatch as ObjectSetProxyQuadMatch,
      );
    } else {
      return new WildcardObjectSetProxy<T>(
        proxyContext,
        quadMatch as WildcardObjectSetProxyQuadMatch,
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
