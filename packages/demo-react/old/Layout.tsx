import type { FunctionComponent, PropsWithChildren } from "react";
import React, { useCallback } from "react";
import { useSolidAuth } from "@ldobjects/solid-react";

const Layout: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const { login, session, logout } = useSolidAuth();

  const loginCb = useCallback(async () => {
    const issuer = prompt(
      "Enter your Pod Provider",
      "https://solidcommunity.net",
    );
    if (issuer) {
      await login(issuer);
    }
  }, []);

  return (
    <div>
      <h1>LDO Solid React Test</h1>
      {session.isLoggedIn ? (
        <div>
          <p>
            Logged in as {session.webId}{" "}
            <button onClick={logout}>Log Out</button>
          </p>
          <hr />
          {children}
        </div>
      ) : (
        <button onClick={loginCb}>Log In</button>
      )}
    </div>
  );
};

export default Layout;
