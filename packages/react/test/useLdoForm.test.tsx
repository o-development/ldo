// useChangeSubject.spec.tsx
/// <reference types="@testing-library/jest-dom" />
import { useResource, useChangeSubject, useSubject } from "./mockLdoMethods.js";
import type { FunctionComponent } from "react";
import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SolidProfileShapeShapeType } from "./.ldo/solidProfile.shapeTypes.js";
import { set } from "@ldo/jsonld-dataset-proxy";
import "@testing-library/jest-dom/vitest";

/**
 * Test component: deterministic friend IDs (Example1, Example2, ...),
 * accessible labels, and committed data shown via useSubject.
 */
const FormTest: FunctionComponent = () => {
  const randomResource = useResource("random");
  const submittedData = useSubject(SolidProfileShapeShapeType, "Example0");

  const [data, setData, commitData] = useChangeSubject(
    SolidProfileShapeShapeType,
    randomResource,
    "Example0",
  );

  return (
    <div>
      <h1>Form</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const result = await commitData();
          console.log(result);
        }}
      >
        {/* Primary name field */}
        <input
          aria-label="Name"
          value={data?.fn ?? ""}
          onChange={(e) =>
            setData((profile) => {
              profile.fn = e.target.value;
            })
          }
        />

        {/* Friends */}
        {data?.knows?.map((person) => (
          <div key={person["@id"]} data-testid={`friend-${person["@id"]}`}>
            <p>{person["@id"]}</p>
            <input
              aria-label={`Friend name for ${person["@id"]}`}
              value={person?.fn ?? ""}
              onChange={(e) =>
                setData((p) => {
                  p.fn = e.target.value;
                }, person)
              }
            />
            <button
              type="button"
              onClick={() => {
                setData((cData) => {
                  cData.knows?.delete(person);
                });
              }}
            >
              Remove Friend
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            // Auto-generate deterministic IDs: Example1, Example2, ...
            const count = data?.knows?.size ?? 0;
            const friendId = `Example${count + 1}`;
            setData((cData) => {
              cData.knows?.add({
                "@id": friendId,
                type: set({ "@id": "Person" }),
                inbox: { "@id": "someInbox" },
              });
            });
          }}
        >
          Add Friend
        </button>

        <button type="submit">Submit</button>
      </form>

      <hr />

      {/* Committed view */}
      <h1>Submitted Data</h1>
      <section aria-label="Submitted Data">
        <p data-testid="submitted-name">Name: {submittedData?.fn ?? ""}</p>
        <ul data-testid="submitted-list">
          {submittedData?.knows?.map((person) => (
            <li key={person["@id"]}>
              Id: {person["@id"]} Name: {person.fn}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

/**
 * Spec: drives the UI as requested.
 */
describe("useChangeSubject", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("handles typing, list add/remove, and commit cycles", async () => {
    render(<FormTest />);

    // 1) Type "Example0" into the Name field, assert after each keystroke
    const nameInput = screen.getByRole("textbox", { name: "Name" });
    const targetName = "Example0";
    let progressive = "";
    for (const c of targetName) {
      progressive += c;
      await user.type(nameInput, c);
      expect(nameInput).toHaveValue(progressive);
    }

    // Submitted is blank so far
    const submittedSection = screen.getByRole("region", {
      name: /submitted data/i,
    });
    const submittedName =
      within(submittedSection).getByTestId("submitted-name");
    const submittedList =
      within(submittedSection).getByTestId("submitted-list");
    expect(submittedName).toHaveTextContent("Name:");
    expect(within(submittedList).queryAllByRole("listitem")).toHaveLength(0);

    // 2) Add two friends -> Example1, Example2
    const addFriendBtn = screen.getByRole("button", { name: /add friend/i });
    await user.click(addFriendBtn);
    await user.click(addFriendBtn);

    const friend1 = screen.getByTestId("friend-Example1");
    const friend2 = screen.getByTestId("friend-Example2");
    expect(within(friend1).getByText("Example1")).toBeInTheDocument();
    expect(within(friend2).getByText("Example2")).toBeInTheDocument();

    // 3) Type friend names with per-keystroke assertions
    const friend1Input = within(friend1).getByRole("textbox", {
      name: "Friend name for Example1",
    });
    const friend2Input = within(friend2).getByRole("textbox", {
      name: "Friend name for Example2",
    });

    const friend1Name = "Example1";
    const friend2Name = "Example2";

    let p = "";
    for (const c of friend1Name) {
      p += c;
      await user.type(friend1Input, c);
      expect(friend1Input).toHaveValue(p);
    }

    p = "";
    for (const c of friend2Name) {
      p += c;
      await user.type(friend2Input, c);
      expect(friend2Input).toHaveValue(p);
    }

    // Still nothing committed
    expect(submittedName).toHaveTextContent("Name:");
    expect(within(submittedList).queryAllByRole("listitem")).toHaveLength(0);

    // 4) Remove Example2
    await user.click(
      within(friend2).getByRole("button", { name: /remove friend/i }),
    );
    expect(screen.queryByTestId("friend-Example2")).not.toBeInTheDocument();

    // 5) Submit -> committed data reflects Example0 + Example1 only
    await user.click(screen.getByRole("button", { name: /submit/i }));

    // Form retained its values
    expect(nameInput).toHaveValue("Example0");
    expect(friend1Input).toHaveValue("Example1");
    expect(screen.queryByTestId("friend-Example2")).not.toBeInTheDocument();

    // Committed view updated
    expect(submittedName).toHaveTextContent("Name: Example0");
    const itemsAfterSubmit = within(submittedList).getAllByRole("listitem");
    expect(itemsAfterSubmit).toHaveLength(1);
    expect(itemsAfterSubmit[0]).toHaveTextContent(
      "Id: Example1 Name: Example1",
    );

    // 6) Change name and resubmit
    await user.clear(nameInput);
    const newName = "anotherExample0";
    let q = "";
    for (const c of newName) {
      q += c;
      await user.type(nameInput, c);
      expect(nameInput).toHaveValue(q);
    }
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(submittedName).toHaveTextContent(`Name: ${newName}`);
    const itemsAfterSecondSubmit =
      within(submittedList).getAllByRole("listitem");
    expect(itemsAfterSecondSubmit).toHaveLength(1);
    expect(itemsAfterSecondSubmit[0]).toHaveTextContent(
      "Id: Example1 Name: Example1",
    );
  });
});
