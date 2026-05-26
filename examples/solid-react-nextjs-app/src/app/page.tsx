"use client";

import styles from "./page.module.css";
import { SubmitEventHandler, useEffect, useState } from "react";
import { useResource, useSolidAuth } from "@ldo/solid-react";

export default function Home() {
  const { fetch, login, logout, ranInitialAuthCheck, session } = useSolidAuth();
  const [issuer, setIssuer] = useState("https://solidcommunity.net/");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const webIdResource = useResource(session.webId, {
    suppressInitialRead: !session.webId,
  });

  useEffect(() => {
    console.log(session.isActive, ranInitialAuthCheck);
  }, [session.isActive, ranInitialAuthCheck]);

  const onLogin: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    await login(issuer, globalThis.location.href);
  };

  const onFetch: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const response = await fetch(url);
    setResult(
      `${response.status} ${response.statusText}\n${await response.text()}`,
    );
  };

  return (
    <div className={styles.page}>
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
