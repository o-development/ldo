import type { SessionCore } from "@uvdsl/solid-oidc-client-browser/core";
import { createContext, useContext } from "react";

/**
 * Functions for authenticating with Solid
 */
export interface SolidAuthFunctions {
  login: SessionCore["login"];
  logout: SessionCore["logout"];
  /**
   * Like `login`, but sends the user to the identity provider's registration
   * screen (OIDC `prompt=create`).
   */
  signUp: (idp: string, redirect_uri: string) => Promise<void>;
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
