import { parseRdf, startTransaction, toSparqlUpdate, toTurtle } from "../lib";
import { FoafProfileShapeType } from "./ldo/foafProfile.shapeTypes";

async function run() {
  const rawTurtle = `
  <#me> a <http://xmlns.com/foaf/0.1/Person>;
      <http://xmlns.com/foaf/0.1/name> "Jane Doe".
  `;

  /**
   * Step 1: Convert Raw RDF into a Linked Data Object
   */
  const ldoDataset = await parseRdf(rawTurtle, {
    baseIRI: "https://solidweb.me/jane_doe/profile/card",
  });
  // Create a linked data object by telling the dataset the type and subject of
  // the object
  const janeProfile = ldoDataset
    // Tells the LDO dataset that we're looking for a FoafProfile
    .usingType(FoafProfileShapeType)
    // Says the subject of the FoafProfile
    .fromSubject("https://solidweb.me/jane_doe/profile/card#me");

  /**
   * Step 2: Manipulate the Linked Data Object
   */
  // Logs "Jane Doe"
  console.log(janeProfile.name);
  // Logs "Person"
  console.log(janeProfile.type);
  // Logs 0
  console.log(janeProfile.knows?.length);

  // Begins a transaction that tracks your changes
  startTransaction(janeProfile);
  janeProfile.name = "Jane Smith";
  janeProfile.knows?.push({
    "@id": "https://solidweb.me/john_smith/profile/card#me",
    type: {
      "@id": "Person",
    },
    name: "John Smith",
    knows: [janeProfile],
  });

  // Logs "Jane Smith"
  console.log(janeProfile.name);
  // Logs "John Smith"
  console.log(janeProfile.knows?.[0].name);
  // Logs "Jane Smith"
  console.log(janeProfile.knows?.[0].knows?.[0].name);

  /**
   * Step 3: Convert it back to RDF
   */
  // Logs:
  // <https://solidweb.me/jane_doe/profile/card#me> a <http://xmlns.com/foaf/0.1/Person>;
  //   <http://xmlns.com/foaf/0.1/name> "Jane Smith";
  //   <http://xmlns.com/foaf/0.1/knows> <https://solidweb.me/john_smith/profile/card#me>.
  // <https://solidweb.me/john_smith/profile/card#me> a <http://xmlns.com/foaf/0.1/Person>;
  //   <http://xmlns.com/foaf/0.1/name> "John Smith";
  //   <http://xmlns.com/foaf/0.1/knows> <https://solidweb.me/jane_doe/profile/card#me>.
  console.log(await toTurtle(janeProfile));
  // Logs:
  // DELETE DATA {
  //   <https://solidweb.me/jane_doe/profile/card#me> <http://xmlns.com/foaf/0.1/name> "Jane Doe" .
  // };
  // INSERT DATA {
  //   <https://solidweb.me/jane_doe/profile/card#me> <http://xmlns.com/foaf/0.1/name> "Jane Smith" .
  //   <https://solidweb.me/jane_doe/profile/card#me> <http://xmlns.com/foaf/0.1/knows> <https://solidweb.me/john_smith/profile/card#me> .
  //   <https://solidweb.me/john_smith/profile/card#me> <http://xmlns.com/foaf/0.1/name> "John Smith" .
  //   <https://solidweb.me/john_smith/profile/card#me> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
  //   <https://solidweb.me/john_smith/profile/card#me> <http://xmlns.com/foaf/0.1/knows> <https://solidweb.me/jane_doe/profile/card#me> .
  // }
  console.log(await toSparqlUpdate(janeProfile));
}
run();
