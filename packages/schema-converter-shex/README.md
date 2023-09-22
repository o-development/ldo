# ShexJ 2 Type and Context

Turn ShexJ into typescript typings and JSON-LD context.

## Installation
```bash
npm i @ldobjects/schema-converter-shex
```

## API
See the [full API docs](docs/modules.md).

## Usage

```typescript
import { Schema } from "shexj";
import shexjToTypeAndContext from "@ldobjects/schema-converter-shex";

async function run() {
  /**
   * Sample ShexJ. Equivalent to:
   *
   * <EmployeeShape> {                # An <EmployeeShape> has:
   *   foaf:givenName  xsd:string+,   # at least one givenName.
   *   foaf:familyName xsd:string,    # one familyName.
   *   foaf:phone      IRI*,          # any number of phone numbers.
   *   foaf:mbox       IRI            # one FOAF mbox.
   * }
   */
  const sampleShexj: Schema = {
    type: "Schema",
    shapes: [
      {
        type: "Shape",
        id: "http://shex.io/webapps/shex.js/doc/EmployeeShape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://xmlns.com/foaf/0.1/givenName",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
              min: 1,
              max: -1,
            },
            {
              type: "TripleConstraint",
              predicate: "http://xmlns.com/foaf/0.1/familyName",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
            },
            {
              type: "TripleConstraint",
              predicate: "http://xmlns.com/foaf/0.1/phone",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
              min: 0,
              max: -1,
            },
            {
              type: "TripleConstraint",
              predicate: "http://xmlns.com/foaf/0.1/mbox",
              valueExpr: {
                type: "NodeConstraint",
                nodeKind: "iri",
              },
            },
          ],
        },
      },
    ],
    "@context": "http://www.w3.org/ns/shex.jsonld",
  };

  const [typings, context] = await shexjToTypeAndContext(sampleShexj);

  /*
  Logs:
  declare namespace  {
    interface EmployeeShape {
        givenName: string[];
        familyName: string;
        phone?: string[];
        mbox: string;
    }

  }
  */
  console.log(typings.typingsString);
  /*
  Logs:
  {
    givenName: {
      '@id': 'http://xmlns.com/foaf/0.1/givenName',
      '@type': 'http://www.w3.org/2001/XMLSchema#string',
      '@container': '@set'
    },
    familyName: {
      '@id': 'http://xmlns.com/foaf/0.1/familyName',
      '@type': 'http://www.w3.org/2001/XMLSchema#string'
    },
    phone: { '@id': 'http://xmlns.com/foaf/0.1/phone', '@container': '@set' },
    mbox: { '@id': 'http://xmlns.com/foaf/0.1/mbox' }
  }
  */
  console.log(context);
}
run();
```


## Liscense
MIT