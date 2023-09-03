import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { FunctionComponent, PropsWithChildren } from "react";
import type { LoginOptions, SessionInfo } from "./SolidAuthContext";
import { SolidAuthContext } from "./SolidAuthContext";
import {
  getDefaultSession,
  handleIncomingRedirect,
  login as libraryLogin,
  logout as libraryLogout,
  fetch as libraryFetch,
} from "@inrupt/solid-client-authn-browser";

const PRE_REDIRECT_URI = "PRE_REDIRECT_URI";

export const BrowserSolidLdoProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [session, setSession] = useState<SessionInfo>(getDefaultSession().info);
  const [ranInitialAuthCheck, setRanInitialAuthCheck] = useState(false);

  const runInitialAuthCheck = useCallback(async () => {
    if (!window.localStorage.getItem(PRE_REDIRECT_URI)) {
      window.localStorage.setItem(PRE_REDIRECT_URI, window.location.href);
    }

    await handleIncomingRedirect({
      restorePreviousSession: true,
    });
    setSession({ ...getDefaultSession().info });

    window.history.replaceState(
      {},
      "",
      window.localStorage.getItem(PRE_REDIRECT_URI),
    );
    window.localStorage.removeItem(PRE_REDIRECT_URI);

    setRanInitialAuthCheck(true);
  }, []);

  const login = useCallback(async (issuer: string, options?: LoginOptions) => {
    console.log("Before full options");
    const fullOptions = {
      redirectUrl: window.location.href,
      clientName: "Solid App",
      oidcIssuer: issuer,
      ...options,
    };
    console.log("After full options");
    window.localStorage.setItem(PRE_REDIRECT_URI, fullOptions.redirectUrl);
    console.log("Set Item");
    console.log(fullOptions);
    await libraryLogin(fullOptions);
    console.log("After login");
    setSession({ ...getDefaultSession().info });
  }, []);

  const logout = useCallback(async () => {
    await libraryLogout();
    setSession({ ...getDefaultSession().info });
  }, []);

  const signUp = useCallback(
    async (issuer: string, options?: LoginOptions) => {
      // The typings on @inrupt/solid-client-authn-core have not yet been updated
      // TODO: remove this ts-ignore when they are updated.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return login(issuer, { ...options, prompt: "create" });
    },
    [login],
  );

  useEffect(() => {
    runInitialAuthCheck();
  }, []);

  const solidAuthFunctions = useMemo(
    () => ({
      runInitialAuthCheck,
      login,
      logout,
      signUp,
      session,
      ranInitialAuthCheck,
      fetch: libraryFetch,
    }),
    [login, logout, ranInitialAuthCheck, runInitialAuthCheck, session, signUp],
  );

  return (
    <SolidAuthContext.Provider value={solidAuthFunctions}>
      {children}
    </SolidAuthContext.Provider>
  );
};
