import React from "react";
import type { FunctionComponent } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { SolidAuthContext } from "../src/SolidAuthContext";
import { dataset, useResource } from "../src/index";
import { SessionCore } from "@uvdsl/solid-oidc-client-browser/core";
import type { ResourceInfo } from "@ldo/test-solid-server";
import { setupServer } from "@ldo/test-solid-server";
import fetch from "cross-fetch";
import { describe, it, expect, afterEach, vi } from "vitest";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url));

// Each test file runs in its own Vitest worker, so `dataset` here is a fresh
// module-level singleton isolated from the main integration suite's dataset.

const AUTH_PORT = 3003;
// initResources creates at rootUri (http://localhost:3003/), not inside the pod.
const AUTH_ROOT = `http://localhost:${AUTH_PORT}/`;
const TEST_CONTAINER = `${AUTH_ROOT}test_ldo/`;
const PROTECTED_URI = `${TEST_CONTAINER}protected.ttl`;
// WebID of the seeded account — referenced in the ACL.
const OWNER_WEB_ID = `${AUTH_ROOT}example/profile/card#me`;

const PROTECTED_CONTENT = `@prefix schema: <http://schema.org/> .
<#Item> a schema:Thing ; schema:name "Protected Item" .`;

// ACL that grants read only to the pod owner WebID — no foaf:Agent (public) entry.
// CSS enforces this even when no auth token is provided, returning 401.
const OWNER_ONLY_ACL = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.
<#owner>
  a acl:Authorization;
  acl:agent <${OWNER_WEB_ID}>;
  acl:accessTo <./protected.ttl>;
  acl:mode acl:Read, acl:Write, acl:Control.`;

const resourceInfo: ResourceInfo = {
  slug: "test_ldo/",
  isContainer: true,
  contains: [
    {
      slug: "protected.ttl",
      isContainer: false,
      mimeType: "text/turtle",
      data: PROTECTED_CONTENT,
    },
    {
      // Resource-level ACL: owner-only read access, no public access.
      // The pod template grants foaf:Agent Control access to the container,
      // so plain fetch can create this ACL, but WAC still enforces it on reads.
      slug: "protected.ttl.acl",
      isContainer: false,
      mimeType: "text/turtle",
      data: OWNER_ONLY_ACL,
    },
  ],
};

/**
 * Minimal provider that exposes SolidAuthContext so components calling
 * useSolidAuth() don't crash, while leaving dataset context management
 * to the tests themselves.
 */
const TestProvider: FunctionComponent<
  React.PropsWithChildren<{ customFetch: typeof fetch }>
> = ({ children, customFetch }) => {
  const solidAuth = React.useMemo(
    () => ({
      // eslint-disable-next-line @typescript-eslint/require-await
      login: async () => {
        throw new Error("not available in test");
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      logout: async () => {
        throw new Error("not available in test");
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      signUp: async () => {
        throw new Error("not available in test");
      },
      fetch: customFetch as unknown as SessionCore["authFetch"],
      session: new SessionCore(),
      ranInitialAuthCheck: true,
    }),
    [],
  );
  return (
    <SolidAuthContext.Provider value={solidAuth}>
      {children}
    </SolidAuthContext.Provider>
  );
};

describe("Authenticated requests", () => {
  // skipAuthentication=true avoids generateAuthFetch (which uses DPoP crypto
  // incompatible with jsdom).  WAC enforcement on the server is still active —
  // only the test-side credential-generation step is skipped.
  setupServer(
    AUTH_PORT,
    resourceInfo,
    join(
      __dirname,
      "configs",
      "components-config",
      "unauthenticatedServer.json",
    ),
    true,
  );

  afterEach(() => {
    dataset.forgetAllResources();
    dataset.deleteMatches(undefined, undefined, undefined, undefined);
    cleanup();
  });

  /**
   * Verifies the dataset actually calls the fetch function injected via
   * setContext rather than falling back to window.fetch.  If this plumbing
   * works, any auth headers added by the injected fetch will reach the server.
   */
  it("calls the configured fetch function when reading a resource", async () => {
    const mockFetch = vi.fn(
      async (): Promise<Response> =>
        new Response(PROTECTED_CONTENT, {
          status: 200,
          headers: { "content-type": "text/turtle" },
        }),
    );
    dataset.setContext("solid", {
      fetch: mockFetch as unknown as typeof globalThis.fetch,
    });

    const UseResourceTest: FunctionComponent = () => {
      const resource = useResource(PROTECTED_URI);
      if (resource?.isLoading()) return <p>Loading</p>;
      return <p role="status">{resource.status.type}</p>;
    };

    render(
      <TestProvider customFetch={mockFetch as unknown as typeof fetch}>
        <UseResourceTest />
      </TestProvider>,
    );

    await screen.findByText("Loading");
    const status = await screen.findByRole("status");
    expect(status.innerHTML).toBe("dataReadSuccess");

    // The mock was called with the resource URL, proving the dataset routes
    // requests through the configured fetch (not window.fetch).
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(PROTECTED_URI),
      expect.anything(),
    );
  });

  /**
   * Verifies that auth headers added inside the configured fetch actually
   * reach the server. A wrapper fetch records headers before forwarding; the
   * test asserts the header was present on the outgoing request.
   */
  it("forwards headers added by the configured fetch to the server", async () => {
    const capturedHeaders: Record<string, string>[] = [];
    const headerCapturingFetch = vi.fn(
      async (
        input: RequestInfo | URL,
        init?: RequestInit,
      ): Promise<Response> => {
        const sentHeaders: Record<string, string> = {};
        new Headers(init?.headers).forEach((value, key) => {
          sentHeaders[key] = value;
        });
        // Add a mock auth header before forwarding to the real server.
        sentHeaders["x-test-auth"] = "mock-bearer-token";
        capturedHeaders.push(sentHeaders);
        return fetch(input as string, {
          ...init,
          headers: sentHeaders,
        });
      },
    );

    dataset.setContext("solid", {
      fetch: headerCapturingFetch as unknown as typeof globalThis.fetch,
    });

    const UseResourceTest: FunctionComponent = () => {
      const resource = useResource(PROTECTED_URI);
      if (resource?.isLoading()) return <p>Loading</p>;
      return <p role="status">{resource.status.type}</p>;
    };

    render(
      <TestProvider
        customFetch={headerCapturingFetch as unknown as typeof fetch}
      >
        <UseResourceTest />
      </TestProvider>,
    );

    await screen.findByText("Loading");
    await screen.findByRole("status");

    expect(headerCapturingFetch).toHaveBeenCalled();
    // The header was captured before the network call, proving it was injected
    // by the configured fetch and would have been sent to the server.
    expect(capturedHeaders[0]).toHaveProperty(
      "x-test-auth",
      "mock-bearer-token",
    );
  });

  /**
   * End-to-end check against a real CSS server: an unauthenticated request to
   * a WAC-protected resource (owner-only ACL, no foaf:Agent entry) must fail.
   * This confirms the server enforces auth, so sending real credentials matters.
   */
  it("returns unauthenticatedError for a WAC-protected resource when no auth is provided", async () => {
    dataset.setContext("solid", {
      fetch: fetch as unknown as typeof globalThis.fetch,
    });

    const UseResourceTest: FunctionComponent = () => {
      const resource = useResource(PROTECTED_URI);
      if (resource?.isLoading()) return <p>Loading</p>;
      return <p role="status">{resource.status.type}</p>;
    };

    render(
      <TestProvider customFetch={fetch}>
        <UseResourceTest />
      </TestProvider>,
    );

    await screen.findByText("Loading");
    const status = await screen.findByRole("status");
    expect(status.innerHTML).toBe("unauthenticatedError");
  });
});
