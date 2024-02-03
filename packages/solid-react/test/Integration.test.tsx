import React from "react";
import type { FunctionComponent } from "react";
import { render, screen } from "@testing-library/react";
import { SAMPLE_DATA_URI, setUpServer } from "./setUpServer";
import { UnauthenticatedSolidLdoProvider } from "../src/UnauthenticatedSolidLdoProvider";
import { useResource } from "../src/useResource";

// Use an increased timeout, since the CSS server takes too much setup time.
jest.setTimeout(40_000);

describe("Integration Tests", () => {
  setUpServer();

  /**
   * ===========================================================================
   * useResource
   * ===========================================================================
   */
  describe("useResource", () => {
    it("Fetches a resource and indicates it is loading while doing so", async () => {
      const UseResourceTest: FunctionComponent = () => {
        const resource = useResource(SAMPLE_DATA_URI);
        if (resource?.isLoading()) return <p>Loading</p>;
        return <p role="status">{resource.status.type}</p>;
      };
      render(
        <UnauthenticatedSolidLdoProvider>
          <UseResourceTest />
        </UnauthenticatedSolidLdoProvider>,
      );
      await screen.findByText("Loading");
      const resourceStatus = await screen.findByRole("status");
      expect(resourceStatus.innerHTML).toBe("dataReadSuccess");
    });
  });
});
