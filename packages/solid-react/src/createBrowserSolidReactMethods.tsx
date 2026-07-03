import React, { useEffect, useMemo, useState, useRef } from "react";
import type { FunctionComponent, PropsWithChildren } from "react";
import { SolidAuthContext, useSolidAuth } from "./SolidAuthContext";
import { Session as SolidOidcSession } from "@uvdsl/solid-oidc-client-browser";
import type { ConnectedLdoDataset, ConnectedPlugin } from "@ldo/connected";
import type { SolidConnectedPlugin } from "@ldo/connected-solid";
import { createUseRootContainerFor } from "./useRootContainerFor";
import { createUseResource } from "@ldo/react";
import libraryFetch from "cross-fetch";
import { SessionCore } from "@uvdsl/solid-oidc-client-browser/core";

type SolidOidcBrowserSession = InstanceType<typeof SolidOidcSession>;
type BrowserSolidLdoProviderProps = PropsWithChildren<{
  clientDetails?: ConstructorParameters<typeof SolidOidcSession>[0];
  sessionOptions?: ConstructorParameters<typeof SolidOidcSession>[1];
}>;

function bindSessionMethods(
  session: SolidOidcBrowserSession,
): SolidOidcBrowserSession {
  session.login = session.login.bind(session);
  session.handleRedirectFromLogin =
    session.handleRedirectFromLogin.bind(session);
  session.restore = session.restore.bind(session);
  session.logout = session.logout.bind(session);
  session.authFetch = session.authFetch.bind(session);
  session.isExpired = session.isExpired.bind(session);
  session.getExpiresIn = session.getExpiresIn.bind(session);
  return session;
}

/**
 * Creates special react methods specific to the Solid
 * @param dataset the connectedLdoDataset with a SolidConnectedPlugin
 * @returns { BrowserSolidLdoProvider, useSolidAuth, useRootContainerFor }
 */
export function createBrowserSolidReactMethods(
  dataset: ConnectedLdoDataset<(SolidConnectedPlugin<[]> | ConnectedPlugin)[]>,
) {
  let currentSession: SolidOidcBrowserSession | undefined;
  const authFetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    return (
      currentSession?.authFetch(input as string | URL | Request, init) ??
      libraryFetch(input, init)
    );
  }) as typeof fetch;

  dataset.setContext("solid", { fetch: authFetch });

  const BrowserSolidLdoProvider: FunctionComponent<
    BrowserSolidLdoProviderProps
  > = ({ children, clientDetails, sessionOptions }) => {
    const [version, setVersion] = useState(0);
    const [ranInitialAuthCheck, setRanInitialAuthCheck] = useState(false);
    const [session] = useState(() => {
      if (typeof SharedWorker === "undefined") return new SessionCore();
      const solidSession = bindSessionMethods(
        new SolidOidcSession(clientDetails, {
          ...sessionOptions,
          onSessionStateChange: (event) => {
            sessionOptions?.onSessionStateChange?.(event);
            setVersion((currentVersion) => currentVersion + 1);
          },
          onSessionExpirationWarning: (event) => {
            sessionOptions?.onSessionExpirationWarning?.(event);
            setVersion((currentVersion) => currentVersion + 1);
          },
          onSessionExpiration: (event) => {
            sessionOptions?.onSessionExpiration?.(event);
            setVersion((currentVersion) => currentVersion + 1);
          },
        }),
      );
      currentSession = solidSession;
      return solidSession;
    });

    const initialized = useRef(false);
    useEffect(() => {
      if (initialized.current) return;
      initialized.current = true;

      async function initializeSession() {
        await session.handleRedirectFromLogin();
        if (!session.isActive) {
          await session.restore().catch(() => undefined);
        }
        setRanInitialAuthCheck(true);
        setVersion((currentVersion) => currentVersion + 1);
      }

      initializeSession();

      return () => {
        if (currentSession === session) {
          currentSession = undefined;
        }
      };
    }, [session]);

    const solidAuth = useMemo(
      () => ({
        login: session.login,
        logout: session.logout,
        signUp: session.login,
        fetch: session.authFetch,
        session,
        ranInitialAuthCheck,
      }),
      [ranInitialAuthCheck, session, version],
    );

    return (
      <SolidAuthContext.Provider value={solidAuth}>
        {children}
      </SolidAuthContext.Provider>
    );
  };

  return {
    BrowserSolidLdoProvider,
    useSolidAuth: useSolidAuth,
    useRootContainerFor: createUseRootContainerFor(
      dataset as ConnectedLdoDataset<SolidConnectedPlugin<[]>[]>,
      createUseResource(dataset as ConnectedLdoDataset<ConnectedPlugin[]>),
    ),
  };
}
