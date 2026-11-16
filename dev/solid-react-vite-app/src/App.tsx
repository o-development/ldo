import { useState } from "react";
import type { FormEvent } from "react";
import { useResource, useSolidAuth } from "@ldo/solid-react";

interface AppProps {
  redirectUri: string;
}

export function App({ redirectUri }: AppProps) {
  const { fetch, login, logout, ranInitialAuthCheck, session } = useSolidAuth();
  const [issuer, setIssuer] = useState("https://solidcommunity.net/");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const webIdResource = useResource(session.webId, {
    suppressInitialRead: !session.webId,
  });

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    await login(issuer, redirectUri);
  }

  async function onFetch(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(url);
    setResult(
      `${response.status} ${response.statusText}\n${await response.text()}`,
    );
  }

  return (
    <div>
      <h1>solid-react auth test</h1>

      <p>checked: {ranInitialAuthCheck ? "yes" : "no"}</p>
      <p>active: {session.isActive ? "yes" : "no"}</p>
      <p>webId: {session.webId ?? ""}</p>
      <p>webId resource: {webIdResource?.status.type ?? ""}</p>

      <form onSubmit={onLogin}>
        <input
          value={issuer}
          onChange={(event) => setIssuer(event.target.value)}
        />
        <button type="submit">login</button>
      </form>

      <button type="button" onClick={logout}>
        logout
      </button>

      <form onSubmit={onFetch}>
        <input value={url} onChange={(event) => setUrl(event.target.value)} />
        <button type="submit">fetch</button>
      </form>

      <pre>{result}</pre>
    </div>
  );
}
