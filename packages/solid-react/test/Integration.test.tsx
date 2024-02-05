import React, { useEffect, useState } from "react";
import type { FunctionComponent } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  SAMPLE_BINARY_URI,
  SAMPLE_DATA_URI,
  SERVER_DOMAIN,
  setUpServer,
} from "./setUpServer";
import { UnauthenticatedSolidLdoProvider } from "../src/UnauthenticatedSolidLdoProvider";
import { useResource } from "../src/useResource";
import { useRootContainerFor } from "../src/useRootContainer";
import { useLdo } from "../src/SolidLdoProvider";
import { PostShShapeType } from "./.ldo/post.shapeTypes";
import type { PostSh } from "./.ldo/post.typings";

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

    it("returns undefined when no uri is provided, then rerenders when one is", async () => {
      const UseResourceUndefinedTest: FunctionComponent = () => {
        const [uri, setUri] = useState<string | undefined>(undefined);
        const resource = useResource(uri, { suppressInitialRead: true });
        if (!resource)
          return (
            <div>
              <p>Undefined</p>
              <button onClick={() => setUri(SAMPLE_DATA_URI)}>Next</button>
            </div>
          );
        return <p role="status">{resource.status.type}</p>;
      };
      render(
        <UnauthenticatedSolidLdoProvider>
          <UseResourceUndefinedTest />
        </UnauthenticatedSolidLdoProvider>,
      );
      await screen.findByText("Undefined");
      fireEvent.click(screen.getByText("Next"));
      const resourceStatus = await screen.findByRole("status");
      expect(resourceStatus.innerHTML).toBe("unfetched");
    });

    it("Reloads the data on mount", async () => {
      const ReloadTest: FunctionComponent = () => {
        const resource = useResource(SAMPLE_DATA_URI, { reloadOnMount: true });
        if (resource?.isLoading()) return <p>Loading</p>;
        return <p role="status">{resource.status.type}</p>;
      };
      const ReloadParent: FunctionComponent = () => {
        const [showComponent, setShowComponent] = useState(true);
        return (
          <div>
            <button onClick={() => setShowComponent(!showComponent)}>
              Show Component
            </button>
            {showComponent ? <ReloadTest /> : <p>Hidden</p>}
          </div>
        );
      };
      render(
        <UnauthenticatedSolidLdoProvider>
          <ReloadParent />
        </UnauthenticatedSolidLdoProvider>,
      );
      await screen.findByText("Loading");
      const resourceStatus1 = await screen.findByRole("status");
      expect(resourceStatus1.innerHTML).toBe("dataReadSuccess");
      fireEvent.click(screen.getByText("Show Component"));
      await screen.findByText("Hidden");
      fireEvent.click(screen.getByText("Show Component"));
      await screen.findByText("Loading");
      const resourceStatus2 = await screen.findByRole("status");
      expect(resourceStatus2.innerHTML).toBe("dataReadSuccess");
    });

    it("handles swapping to a new resource", async () => {
      const SwapResourceTest: FunctionComponent = () => {
        const [uri, setUri] = useState(SAMPLE_DATA_URI);
        const resource = useResource(uri);
        if (resource?.isLoading()) return <p>Loading</p>;
        return (
          <div>
            <p role="status">{resource.status.type}</p>
            <button onClick={() => setUri(SAMPLE_BINARY_URI)}>
              Update URI
            </button>
          </div>
        );
      };
      render(
        <UnauthenticatedSolidLdoProvider>
          <SwapResourceTest />
        </UnauthenticatedSolidLdoProvider>,
      );
      await screen.findByText("Loading");
      const resourceStatus1 = await screen.findByRole("status");
      expect(resourceStatus1.innerHTML).toBe("dataReadSuccess");
      fireEvent.click(screen.getByText("Update URI"));
      await screen.findByText("Loading");
      const resourceStatus2 = await screen.findByRole("status");
      expect(resourceStatus2.innerHTML).toBe("binaryReadSuccess");
    });
  });

  describe("useRootContainer", () => {
    it("gets the root container for a sub-resource", async () => {
      const RootContainerTest: FunctionComponent = () => {
        const rootContainer = useRootContainerFor(SAMPLE_DATA_URI, {
          suppressInitialRead: true,
        });
        return rootContainer ? (
          <p role="root">{rootContainer?.uri}</p>
        ) : undefined;
      };
      render(
        <UnauthenticatedSolidLdoProvider>
          <RootContainerTest />
        </UnauthenticatedSolidLdoProvider>,
      );
      const container = await screen.findByRole("root");
      expect(container.innerHTML).toBe(SERVER_DOMAIN);
    });

    it("returns undefined when a URI is not provided", async () => {
      const RootContainerTest: FunctionComponent = () => {
        const rootContainer = useRootContainerFor(undefined, {
          suppressInitialRead: true,
        });
        return rootContainer ? (
          <p role="root">{rootContainer?.uri}</p>
        ) : (
          <p role="undefined">Undefined</p>
        );
      };
      render(
        <UnauthenticatedSolidLdoProvider>
          <RootContainerTest />
        </UnauthenticatedSolidLdoProvider>,
      );
      const container = await screen.findByRole("undefined");
      expect(container.innerHTML).toBe("Undefined");
    });
  });

  describe("useLdoMethod", () => {
    it("uses get subject to get a linked data object", async () => {
      const GetSubjectTest: FunctionComponent = () => {
        const [subject, setSubject] = useState<PostSh | undefined>();
        const { getSubject } = useLdo();
        useEffect(() => {
          const someSubject = getSubject(
            PostShShapeType,
            "https://example.com/subject",
          );
          setSubject(someSubject);
        }, []);
        return subject ? <p role="subject">{subject["@id"]}</p> : undefined;
      };
      render(
        <UnauthenticatedSolidLdoProvider>
          <GetSubjectTest />
        </UnauthenticatedSolidLdoProvider>,
      );
      const container = await screen.findByRole("subject");
      expect(container.innerHTML).toBe("https://example.com/subject");
    });

    it("uses createData to create a new data object", async () => {
      const GetSubjectTest: FunctionComponent = () => {
        const [subject, setSubject] = useState<PostSh | undefined>();
        const { createData, getResource } = useLdo();
        useEffect(() => {
          const someSubject = createData(
            PostShShapeType,
            "https://example.com/subject",
            getResource("https://example.com/"),
          );
          someSubject.articleBody = "Cool Article";
          setSubject(someSubject);
        }, []);
        return subject ? (
          <p role="subject">{subject.articleBody}</p>
        ) : undefined;
      };
      render(
        <UnauthenticatedSolidLdoProvider>
          <GetSubjectTest />
        </UnauthenticatedSolidLdoProvider>,
      );
      const container = await screen.findByRole("subject");
      expect(container.innerHTML).toBe("Cool Article");
    });
  });
});
