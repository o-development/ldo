import { useState, type FunctionComponent } from "react";
import { useResource, useChangeSubject, useSubject } from "../../../solid-react";
import { SolidProfileShapeShapeType } from "../../test/.ldo/solidProfile.shapeTypes.js";
import { set } from "@ldo/ldo";

const FormTest: FunctionComponent = () => {
  const randomResource = useResource("http://example.com/resource.ttl");
  const submittedData = useSubject(SolidProfileShapeShapeType, "Example0");

  const [count, setCount] = useState(1);

  const [data, setData, commitData] = useChangeSubject(
    SolidProfileShapeShapeType,
    "Example0",
  );

  console.log("This is data", data);

  return (
    <div>
      <h1>Form</h1>
      <button onClick={() => setCount(count + 1)}>Rerender {count}</button>
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
          onChange={(e) => {
            setData(randomResource, (profile) => {
              console.log("Inside changer");
              profile.fn = e.target.value;
            })
          }}
        />

        {/* Friends */}
        {data?.knows?.map((person) => (
          <div key={person["@id"]} data-testid={`friend-${person["@id"]}`}>
            <p>{person["@id"]}</p>
            <input
              aria-label={`Friend name for ${person["@id"]}`}
              value={person?.fn ?? ""}
              onChange={(e) =>
                setData(randomResource, (p) => {
                  p.fn = e.target.value;
                }, person)
              }
            />
            <button
              type="button"
              onClick={() => {
                setData(randomResource, (cData) => {
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
            const friendId = `Example${count}`;
            setCount(count + 1);
            setData(randomResource, (cData) => {
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

        <input type="submit" value="Submit" />
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

function App() {

  return (
    <div>
      <FormTest />
    </div>
  )
}

export default App
