import React from "react";
import { createRoot } from "react-dom/client";
import refreshWorkerUrl from "@uvdsl/solid-oidc-client-browser/RefreshWorker?url";
import { BrowserSolidLdoProvider } from "@ldo/solid-react";
import { App } from "./App";

const redirectUri = `${window.location.origin}${window.location.pathname}`;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserSolidLdoProvider
      clientDetails={{
        redirect_uris: [redirectUri],
        client_name: "LDO Solid React Dev App",
      }}
      sessionOptions={{ workerUrl: refreshWorkerUrl }}
    >
      <App redirectUri={redirectUri} />
    </BrowserSolidLdoProvider>
  </React.StrictMode>,
);
