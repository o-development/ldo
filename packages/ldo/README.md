# LDO (Linked Data Objects)

LDO (Linked Data Objects) is a library that lets you easily manipulate RDF as if it were a standard TypeScript object that follows a [ShEx](https://shex.io) shape you define.

For a full tutorial of using LDO to build React Solid applications, see [this tutorial](https://medium.com/@JacksonMorgan/building-solid-apps-with-ldo-6127a5a1979c).

## Setup

### Automatic Setup
To setup LDO, `cd` into your typescript project and run `npx @ldo/cli init`.

```bash
cd my-typescript-project
npx @ldo/cli init
```

### Manual Setup
The following is handled by the __automatic setup__:

Install the LDO dependencies.
```bash
npm install @ldo/ldo
npm install @ldo/cli --save-dev
```

Create a folder to store your ShEx shapes:
```bash
mkdir shapes
```

Create a script to build ShEx shapes and convert them into Linked Data Objects. You can put this script in `package.json`
```json
{
  ...
  scripts: {
    ...
    "build:ldo": "ldo build --input ./shapes --output ./ldo"
    ...
  }
  ...
}
```

## Creating ShEx Schemas
LDO uses [ShEx](https://shex.io) as a schema for the RDF data in your project. To add a ShEx schema to your project, simply create a file ending in `.shex` to the `shapes` folder.

For more information on writing ShEx schemas see the [ShEx Primer](http://shex.io/shex-primer/index.html).


`./shapes/foafProfile.shex`:
```shex
PREFIX ex: <https://example.com/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

ex:FoafProfile EXTRA a {
  a [ foaf:Person ]
    // rdfs:comment  "Defines the node as a Person (from foaf)" ;
  foaf:name xsd:string ?
    // rdfs:comment  "Define a person's name." ;
  foaf:img xsd:string ?
    // rdfs:comment  "Photo link but in string form" ;
  foaf:knows @ex:FoafProfile *
    // rdfs:comment  "A list of WebIds for all the people this user knows." ;
}
```

To build the shape, run:
```bash
npm run build:ldo
```

This will generate five files:
 - `./ldo/foafProfile.shapeTypes.ts` <-- This is the important file
 - `./ldo/foafProfile.typings.ts`
 - `./ldo/foafProfile.schema.ts`
 - `./ldo/foafProfile.context.ts`

## Simple Example

Below is a simple example of LDO in a real use-case (changing the name on a Solid Pod)

```typescript
import { parseRdf, startTransaction, toSparqlUpdate, toTurtle } from "ldo";
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
```

## Getting an LDO Dataset

An LDO Dataset is a kind of [RDF JS Dataset](https://rdf.js.org/dataset-spec/) that can create linked data objects.

LDO datasets can be created in two ways:

`createLdoDataset(initialDataset?: Dataset<Quad, Quad> | Quad[])`
```typescript
import { createLdoDataset } from "ldo";

const ldoDataset = createLdoDataset();
```

 - `initialDataset`: An optional dataset or array of quads for the new dataset.

`parseRdf(data: string, parserOptions?: ParserOptions)`
```typescript
import { parseRdf } from "ldo";

const rawTurtle = "...";
const ldoDataset = parseRdf(rawTurtle, { baseIRI: "https://example.com/" });
```

 - `data`: The raw data to parse as a `string`.
 - `options` (optional): Parse options containing the following keys:
    - `format` (optional): The format the data is in. The following are acceptable formats: `Turtle`, `TriG`, `N-Triples`, `N-Quads`, `N3`, `Notation3`.
    - `baseIRI` (optional): If this data is hosted at a specific location, you can provide the baseIRI of that location.
    - `blankNodePrefix` (optional): If blank nodes should have a prefix, that should be provided here.
    - `factory` (optional): a RDF Data Factory from  [`@rdfjs/data-model`](https://www.npmjs.com/package/@rdfjs/data-model). 

## Getting a Linked Data Object
Once you have an LdoDataset we can get a Linked Data Object. A linked data object feels just like a JavaScript object literal, but when you make modifications to it, it will affect the underlying LdoDataset.

Thie first step is defining which Shape Type you want to retrieve from the dataset. We can use the generated shape types and the `usingType()` method for this.

```typescript
import { FoafProfileShapeType } from "./ldo/foafProfile.shapeTypes.ts";

// ... Get the LdoDataset

ldoDataset.usingType(FoafProfileShapeType);
```

Next, we want to identify exactly what part of the dataset we want to extract. We can do this in a few ways:

### `.fromSubject(entryNode)`
`fromSubject` lets you define a an `entryNode`, the place of entry for the graph. The object returned by `jsonldDatasetProxy` will represent the given node. This parameter accepts both `namedNode`s and `blankNode`s. `fromSubject` takes a generic type representing the typescript type of the given subject.

```typescript
const profile = ldoDataset
  .usingType(FoafProfileShapeType)
  .fromSubject("http://example.com/Person1");
```

### `.matchSubject(predicate?, object?, graph?)`
`matchSubject` returns a Jsonld Dataset Proxy representing all subjects in the dataset matching the given predicate, object, and graph.

```typescript
const profiles = ldoDataset
  .usingType(FoafProfileShapeType)
  .matchSubject(
    namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    namedNode("http://xmlns.com/foaf/0.1/Person")
  );
profiles.forEach((person) => {
  console.log(person.fn);
});
```

### `.matchObject(subject?, predicate?, object?)`
`matchObject` returns a Jsonld Dataset Proxy representing all objects in the dataset matching the given subject, predicate, and graph.

```typescript
const friendsOfPerson1 = ldoDataset
  .usingType(FoafProfileShapeType)
  .matchSubject(
    namedNode("http://example.com/Person1"),
    namedNode("http://xmlns.com/foaf/0.1/knows")
  );
friendsOfPerson1.forEach((person) => {
  console.log(person.fn);
});
```

### `.fromJson(inputData)`
`fromJson` will take any regular Json, add the information to the dataset, and return a Jsonld Dataset Proxy representing the given data.

```typescript
const person2 = ldoDataset
  .usingType(FoafProfileShapeType)
  .fromJson({
    "@id": "http://example.com/Person2",
    fn: ["Jane Doe"],
  });
```

## Getting and Setting Data on a Linked Data Object
Once you've created a Linked Data Object, you can get and set data as if it were a normal TypeScript Object. For specific details, see the documentation at [JSONLD Dataset Proxy](https://github.com/o-development/jsonld-dataset-proxy/blob/master/Readme.md).

```typescript
import { LinkedDataObject } from "ldo";
import { FoafProfileFactory } from "./ldo/foafProfile.ldoFactory.ts";
import { FoafProfile } from "./ldo/foafProfile.typings";

aysnc function start() {
  const profile: FoafProfile = // Create LDO
  // Logs "Aang"
  console.log(profile.name);
  // Logs "Person"
  console.log(profile.type);
  // Logs 1
  console.log(profile.knows?.length);
  // Logs "Katara"
  console.log(profile.knows?.[0].name);
  profile.name = "Bonzu Pippinpaddleopsicopolis III"
  // Logs "Bonzu Pippinpaddleopsicopolis III"
  console.log(profile.name);
  profile.knows?.push({
    type: "Person",
    name: "Sokka"
  });
  // Logs 2
  console.log(profile.knows?.length);
  // Logs "Katara" and "Sokka"
  profile.knows?.forEach((person) => console.log(person.name));
}
```

## Converting a Linked Data Object back to RDF
A linked data object can be converted into RDF in multiple ways:

### `toTurtle(linkedDataObject)`
```typescript
import { toTurtle } from "ldo"
// ...
const rawTurtle: string = await toTurtle(profile);
```

### `toNTiples(linkedDataObject)`
```typescript
import { toNTriples } from "ldo"
// ...
const rawNTriples: string = await toNTriples(profile);
```

### `serialize(linkedDataObject, options)`
```typescript
const rawTurtle: string = await profile.$serialize({
  format: "Turtle",
  prefixes: {
    ex: "https://example.com/",
    foaf: "http://xmlns.com/foaf/0.1/",
  }
});
```
`serialize(linkedDataObject, options)` provides general serialization based on provided options:
 - `foramt` (optional): The format to serialize to. The following are acceptable formats: `Turtle`, `TriG`, `N-Triples`, `N-Quads`, `N3`, `Notation3`.
 - `prefixes`: The prefixes for those serializations that use prefixes.

## Transactions

Sometimes, you want to keep track of changes you make for the object. This is where transactions come in handy.

To start a transaction, use the `startTransaction(linkedDataObject)` function. From then on, all transactions will be tracked, but not added to the original ldoDataset. You can view the changes using the `transactionChanges(linkedDataObject)` or `toSparqlUpdate(linkedDataObject)` methods. When you're done with the transaction, you can run the `commitTransaction(linkedDataObject)` method to add the changes to the original ldoDataset.

```typescript
import {
  startTransaction,
  transactionChanges,
  toSparqlUpdate,
  commitTransaction,
} from "ldo"; 

// ... Get the profile linked data object

startTransaction(profile);
profile.name = "Kuzon"
const changes = transactionChanges(profile));
// Logs: <https://example.com/aang> <http://xmlns.com/foaf/0.1/name> "Kuzon"
console.log(changes.added?.toString())
// Logs: <https://example.com/aang> <http://xmlns.com/foaf/0.1/name> "Aang"
console.log(changes.removed?.toString())
console.log(await toSparqlUpdate(profile));
commitTransaction(profile);
```

## Other LDO Helper Functions

### `getDataset(linkedDataObject)`
Returns the Linked Data Object's underlying RDFJS dataset. Modifying this dataset will change the Linked Data Object as well.
```typescript
import { getDataset } from "ldo"
const dataset = getDataset(profile);
```

## Sponsorship
This project was made possible by a grant from NGI Zero Entrust via nlnet. Learn more on the [NLnet project page](https://nlnet.nl/project/SolidUsableApps/).

[<img src="https://nlnet.nl/logo/banner.png" alt="nlnet foundation logo" width="300" />](https://nlnet.nl/)
[<img src="https://nlnet.nl/image/logos/NGI0Entrust_tag.svg" alt="NGI Zero Entrust Logo" width="300" />](https://nlnet.nl/)

## Liscense
MIT
