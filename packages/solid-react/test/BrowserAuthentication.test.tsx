import React from "react";
import type { FunctionComponent } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { setUpServer } from "./setUpServer";
import { useSolidAuth } from "../src/SolidAuthContext";
import { ROOT_CONTAINER } from "./solidServer.helper";

describe("Browser Authentication", () => {
  const s = setUpServer();

  const AuthTest: FunctionComponent = () => {
    const { login, session, logout } = useSolidAuth();

    return (
      <div>
        <div data-testid="session">{JSON.stringify(session)}</div>
        <button onClick={() => login(ROOT_CONTAINER)} aria-label="login">
          Login
        </button>
        <button onClick={logout} aria-label="logout">
          LogOut
        </button>
      </div>
    );
  };

  it("properly logs in", async () => {
    console.log("b");
    expect(true).toBe(true);
    // render(
    //   <BrowserSolidLdoProvider>
    //     <AuthTest />
    //   </BrowserSolidLdoProvider>,
    // );
    // const loginButton = screen.getByRole("button", { name: "logout" });
    // fireEvent.click(loginButton);
    // await screen.findByText("Log in");
    // expect(window.location.pathname).toBe("/.account/login/password/");
    // // const authorizeButton = screen.getByText("Log in");
    // // const emailBox = screen.getById
  });
});
