import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ISessionInfo,
  handleIncomingRedirect,
  login as libraryLogin,
  getDefaultSession,
  logout as libraryLogout,
  fetch as libraryFetch,
} from "solid-authn-react-native";

import { createGlobalHook } from "./util/createGlobalHook";

const PRE_REDIRECT_URI = "PRE_REDIRECT_URI";

interface AuthGlobalHookReturn {
  runInitialAuthCheck: () => Promise<void>;
  login: (issuer: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (issuer: string) => Promise<void>;
  fetch: typeof fetch;
  session: ISessionInfo;
  ranInitialAuthCheck: boolean;
}

function useAuthGlobalHookFunc(): AuthGlobalHookReturn {
  const [session, setSession] = useState<ISessionInfo>(
    getDefaultSession().info
  );
  const [ranInitialAuthCheck, setRanInitialAuthCheck] = useState(false);

  const runInitialAuthCheck = useCallback(async () => {
    // TODO: Change this to dependency injection so it works in React Native
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
      window.localStorage.getItem(PRE_REDIRECT_URI)
    );
    window.localStorage.removeItem(PRE_REDIRECT_URI);

    setRanInitialAuthCheck(true);
  }, []);

  const login = useCallback(
    async (issuer: string, clientName = "Solid App") => {
      window.localStorage.setItem(PRE_REDIRECT_URI, window.location.href);
      await libraryLogin({
        oidcIssuer: issuer,
        // TODO: this ties this to in-browser use
        redirectUrl: window.location.href,
        clientName,
      });
      setSession({ ...getDefaultSession().info });
    },
    []
  );

  const logout = useCallback(async () => {
    await libraryLogout();
    setSession({ ...getDefaultSession().info });
  }, []);

  const signUp = useCallback(async (issuer: string) => {
    /* Do nothing for now */
    console.log(`Signup Pressed with issuer ${issuer}`);
  }, []);

  useEffect(() => {
    runInitialAuthCheck();
  }, []);

  return useMemo(
    () => ({
      runInitialAuthCheck,
      login,
      logout,
      signUp,
      session,
      ranInitialAuthCheck,
      fetch: libraryFetch,
    }),
    [login, logout, ranInitialAuthCheck, runInitialAuthCheck, session, signUp]
  );
}

const authGlobalHook = createGlobalHook(useAuthGlobalHookFunc);

export const SolidAuthContext = authGlobalHook.Context;
export const SolidAuthProvider = authGlobalHook.Provider;
export const useSolidAuth = authGlobalHook.useGlobal;
