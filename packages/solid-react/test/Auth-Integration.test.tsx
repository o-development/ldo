import React, { type FunctionComponent, useEffect } from "react";
import { beforeEach, describe, it, vi, expect } from "vitest";
import { useSolidAuth } from "../src/SolidAuthContext.js";
import { render, waitFor } from "@testing-library/react";
import { BrowserSolidLdoProvider } from "@ldo/solid-react";
import { handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";

window.localStorage = {
  length: 0,
  getItem: () => null,
  setItem: () => {},
  clear: () => {},
  removeItem: () => {},
  key: () => null,
};

vi.mock("@inrupt/solid-client-authn-browser", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    handleIncomingRedirect: vi.fn(),
  };
});

describe("Solid Auth Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // https://github.com/o-development/ldo/issues/52
  it("keeps ranInitialAuthCheck and session.isLoggedIn in sync", async () => {
    const renders: ReturnType<typeof useSolidAuth>[] = [];

    vi.mocked(handleIncomingRedirect).mockResolvedValue({
      isLoggedIn: true,
      sessionId: "handle-incoming-redirect",
    });

    const TestComponent: FunctionComponent = () => {
      const result = useSolidAuth();
      useEffect(() => {
        renders.push(result);
      });
      return null;
    };

    render(
      <BrowserSolidLdoProvider>
        <TestComponent />
      </BrowserSolidLdoProvider>,
    );

    await waitFor(() => {
      expect(renders.some((render) => render.session.isLoggedIn)).toBe(true);
      expect(renders.some((render) => render.ranInitialAuthCheck)).toBe(true);
    });

    for (const renderData of renders) {
      if (renderData.ranInitialAuthCheck === true) {
        expect(renderData.session.isLoggedIn).toEqual(true);
      } else {
        expect(renderData.session.isLoggedIn).toEqual(false);
      }
    }
  });
});
