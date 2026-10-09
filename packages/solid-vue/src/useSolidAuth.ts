import {
  inject,
  onMounted,
  provide,
  ref,
  type Ref,
  type InjectionKey,
  shallowRef,
  triggerRef,
  onBeforeUnmount,
  getCurrentInstance,
} from "vue";
import { Session, SessionEvents } from "@uvdsl/solid-oidc-client-browser";

type SolidAuthSession = {
  login: Session["login"];
  logout: Session["logout"];
  signUp: Session["login"];
  fetch: Session["authFetch"];
  session: Ref<Session>;
  ranInitialAuthCheck: Ref<boolean>;
};

const OidcSessionKey: InjectionKey<SolidAuthSession> = Symbol(
  "solid auth context identifier",
);

/**
 * A composable that sets up Solid OIDC authentication session.
 * It provides the enhanced session to children and returns it.
 * This composable should be called in the parent / root component of your Vue app.
 * To access the authentication object in a child component, call `useSolidAuth()` composable in it.
 */
export function provideSolidAuth({
  clientDetails,
  sessionOptions,
  waitFor,
}: {
  clientDetails?: ConstructorParameters<typeof Session>[0];
  sessionOptions?: ConstructorParameters<typeof Session>[1];
  waitFor?: () => Promise<void>;
} = {}) {
  const session = new Session(clientDetails, sessionOptions);
  const sessionRef = shallowRef(session);
  const ranInitialAuthCheck = ref(false);

  const notify = () => triggerRef(sessionRef);

  const handleStateChange = (event: Event) => {
    sessionOptions?.onSessionStateChange?.(event);
    notify();
  };
  const handleExpirationWarning = (event: Event) => {
    sessionOptions?.onSessionExpirationWarning?.(event);
    notify();
  };
  const handleExpiration = (event: Event) => {
    sessionOptions?.onSessionExpiration?.(event);
    notify();
  };

  session.addEventListener(SessionEvents.STATE_CHANGE, handleStateChange);
  session.addEventListener(
    SessionEvents.EXPIRATION_WARNING,
    handleExpirationWarning,
  );
  session.addEventListener(SessionEvents.EXPIRATION, handleExpiration);

  onMounted(async () => {
    // handle quirks of the vue-router
    const instance = getCurrentInstance();
    const router = instance?.appContext.config.globalProperties.$router;
    // wait for the router before we handle incoming redirect
    // this is to avoid race condition in initial redirect
    // in particular when the app uses vue-router with web router
    let hash = "";
    if (typeof router?.isReady === "function") {
      await router.isReady();
      // but hash router also ruins callback URI because of added hash
      // so we want to remove that hash
      if (globalThis.location.href.includes("#")) {
        const uri = new URL(globalThis.location.href);
        hash = uri.hash;
        uri.hash = "";
        globalThis.history.replaceState({}, "", uri);
      }
    }
    await waitFor?.();

    try {
      await session.handleRedirectFromLogin();
      if (!session.isActive) await session.restore().catch(() => {});
    } finally {
      // put the hash back if we took it
      if (hash) {
        const finalUri = new URL(globalThis.location.href);
        if (!finalUri.hash) {
          finalUri.hash = hash;
          globalThis.history.replaceState(
            globalThis.history.state,
            "",
            finalUri,
          );
        }
      }
      ranInitialAuthCheck.value = true;
    }
  });

  onBeforeUnmount(() => {
    session.removeEventListener(SessionEvents.STATE_CHANGE, handleStateChange);
    session.removeEventListener(
      SessionEvents.EXPIRATION_WARNING,
      handleExpirationWarning,
    );
    session.removeEventListener(SessionEvents.EXPIRATION, handleExpiration);
  });

  const solidAuth: SolidAuthSession = {
    session: sessionRef,
    login: session.login.bind(session),
    logout: session.logout.bind(session),
    signUp: session.login.bind(session),
    fetch: session.authFetch.bind(session),
    ranInitialAuthCheck,
  };

  provide(OidcSessionKey, solidAuth);

  return solidAuth;
}

/**
 * Composable that returns Solid auth session.
 * In order to use it, you have to run provideSolidAuth in an ancestor component.
 */
export function useSolidAuth() {
  const auth = inject(OidcSessionKey);
  if (!auth) throw new Error("useSolidAuth must have session provided");
  return auth;
}
