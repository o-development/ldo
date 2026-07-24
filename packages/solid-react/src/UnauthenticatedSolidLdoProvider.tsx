/* istanbul ignore file */
import React, { useCallback, useMemo } from "react";
import type { FunctionComponent, PropsWithChildren } from "react";
import { SessionCore } from "@uvdsl/solid-oidc-client-browser/core";
import type { SolidAuthFunctions } from "./SolidAuthContext";
import { SolidAuthContext } from "./SolidAuthContext";

/**
 * A provider for interacting with Solid Pods without authenticating
 */
export const UnauthenticatedSolidLdoProvider: FunctionComponent<
  PropsWithChildren
> = ({ children }) => {
  const session = useMemo(() => new SessionCore(), []);
  const login = useCallback<SolidAuthFunctions["login"]>(async () => {
    throw new Error(
      "login is not available for a UnauthenticatedSolidLdoProvider",
    );
  }, []);
  const logout = useCallback<SolidAuthFunctions["logout"]>(async () => {
    throw new Error(
      "logout is not available for a UnauthenticatedSolidLdoProvider",
    );
  }, []);
  const fetch = useCallback<SolidAuthFunctions["fetch"]>((input, init) => {
    return globalThis.fetch(input, init);
  }, []);

  const solidAuthFunctions = useMemo<SolidAuthFunctions>(
    () => ({
      login,
      logout,
      signUp: login,
      fetch,
      session,
      ranInitialAuthCheck: true,
    }),
    [fetch, login, logout, session],
  );

  return (
    <SolidAuthContext.Provider value={solidAuthFunctions}>
      {children}
    </SolidAuthContext.Provider>
  );
};
