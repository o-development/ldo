import type { SessionCore } from "@uvdsl/solid-oidc-client-browser/core";
import { createContext, useContext } from "react";

/**
 * Functions for authenticating with Solid
 */
export interface SolidAuthFunctions {
  login: SessionCore["login"];
  logout: SessionCore["logout"];
  signUp: SessionCore["login"];
  fetch: SessionCore["authFetch"];
  session: SessionCore;
  ranInitialAuthCheck: boolean;
}

export const SolidAuthContext = createContext<SolidAuthFunctions | undefined>(
  undefined,
);

export function useSolidAuth(): SolidAuthFunctions {
  const solidAuth = useContext(SolidAuthContext);
  if (!solidAuth) {
    throw new Error("useSolidAuth must be used within a SolidAuthContext");
  }
  return solidAuth;
}
