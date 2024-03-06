import type { ContextDefinition } from "jsonld";
import type { Schema } from "shexj";
import type { LdoJsonldContext } from "../src/LdoJsonldContext";

export interface Bender {
  "@id"?: string;
  "@context"?: ContextDefinition;
  type: "Bender";
  element: Element;
  friend: (Bender | NonBender | Avatar)[];
}

export interface Avatar {
  "@id"?: string;
  "@context"?: ContextDefinition;
  type: "Avatar";
  element: Element[];
  friend: (Bender | NonBender | Avatar)[];
}

export interface NonBender {
  "@id"?: string;
  "@context"?: ContextDefinition;
  type: "Avatar";
  friend: (Bender | NonBender | Avatar)[];
}

export type Element =
  | {
      "@id": "VideoObject";
    }
  | {
      "@id": "ImageObject";
    }
  | {
      "@id": "MediaObject";
    }
  | {
      "@id": "CreativeWork";
    };

// No need to fully define the schema because this library doesn't use it
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const patientSchema: Schema = {};

export const patientContext: LdoJsonldContext = {
  Bender: {
    "@id": "https://example.com/Bender",
    "@context": {
      type: {
        "@id": "@type",
      },
      element: {
        "@id": "https://example.com/element",
      },
      friend: {
        "@id": "https://example.com/friend",
      }
    },
  },

  Patient: "http://hl7.org/fhir/Patient",
  subject: { "@id": "http://hl7.org/fhir/subject", "@type": "@id" },
  name: {
    "@id": "http://hl7.org/fhir/name",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
    "@container": "@set",
  },
  langName: {
    "@id": "http://hl7.org/fhir/langName",
    "@type": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
    "@container": "@set",
  },
  birthdate: {
    "@id": "http://hl7.org/fhir/birthdate",
    "@type": "http://www.w3.org/2001/XMLSchema#date",
  },
  age: {
    "@id": "http://hl7.org/fhir/age",
    "@type": "http://www.w3.org/2001/XMLSchema#integer",
  },
  isHappy: {
    "@id": "http://hl7.org/fhir/isHappy",
    "@type": "http://www.w3.org/2001/XMLSchema#boolean",
  },
  roommate: {
    "@id": "http://hl7.org/fhir/roommate",
    "@type": "@id",
    "@container": "@set",
  },
  notes: {
    "@id": "http://hl7.org/fhir/notes",
    "@type": "http://www.w3.org/2001/XMLSchema#string",
  },
  langNotes: {
    "@id": "http://hl7.org/fhir/langNotes",
    "@type": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
  },
};

export const patientData = `
@prefix example: <http://example.com/> .
@prefix fhir: <http://hl7.org/fhir/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

example:Observation1
  fhir:notes "Cool Notes"^^xsd:string ;
  fhir:subject example:Patient1 .

example:Patient1
  rdf:type fhir:Patient ; 
  fhir:name "Garrett"^^xsd:string,  "Bobby"^^xsd:string, "Ferguson"^^xsd:string ;
  fhir:birthdate "1986-01-01"^^xsd:date ;
  fhir:age "35"^^xsd:integer ;
  fhir:isHappy "true"^^xsd:boolean ;
  fhir:roommate example:Patient2, example:Patient3 .

example:Patient2
  rdf:type fhir:Patient ; 
  fhir:name "Rob"^^xsd:string ;
  fhir:birthdate "1987-01-01"^^xsd:date ;
  fhir:age "34"^^xsd:integer ;
  fhir:isHappy "false"^^xsd:boolean ;
  fhir:roommate example:Patient1, example:Patient3 .

example:Patient3
  rdf:type fhir:Patient ; 
  fhir:name "Amy"^^xsd:string ;
  fhir:birthdate "1988-01-01"^^xsd:date ;
  fhir:age "33"^^xsd:integer ;
  fhir:isHappy "true"^^xsd:boolean .
`;

export const patientDataWithBlankNodes = `
@prefix example: <http://example.com/> .
@prefix fhir: <http://hl7.org/fhir/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

example:Observation1
  fhir:notes "Cool Notes"^^xsd:string ;
  fhir:subject _:Patient1 .

_:Patient1
  fhir:name "Garrett"^^xsd:string,  "Bobby"^^xsd:string, "Ferguson"^^xsd:string ;
  fhir:birthdate "1986-01-01"^^xsd:date ;
  fhir:age "35"^^xsd:integer ;
  fhir:isHappy "true"^^xsd:boolean ;
  fhir:roommate _:Patient2, _:Patient3 .

_:Patient2
  fhir:name "Rob"^^xsd:string ;
  fhir:birthdate "1987-01-01"^^xsd:date ;
  fhir:age "34"^^xsd:integer ;
  fhir:isHappy "false"^^xsd:boolean ;
  fhir:roommate _:Patient1, _:Patient3 .

_:Patient3
  fhir:name "Amy"^^xsd:string ;
  fhir:birthdate "1988-01-01"^^xsd:date ;
  fhir:age "33"^^xsd:integer ;
  fhir:isHappy "true"^^xsd:boolean .
`;

export const tinyPatientData = `
@prefix example: <http://example.com/> .
@prefix fhir: <http://hl7.org/fhir/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

example:Observation1
  fhir:subject example:Patient1 .

example:Patient1
  fhir:name "Garrett"^^xsd:string ;
  fhir:roommate example:Patient2 .

example:Patient2
  fhir:name "Rob"^^xsd:string ;
  fhir:roommate example:Patient1 .
`;

export const tinyArrayPatientData = `
@prefix example: <http://example.com/> .
@prefix fhir: <http://hl7.org/fhir/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

example:Patient1
  fhir:name "Garrett"^^xsd:string,  "Bobby"^^xsd:string, "Ferguson"^^xsd:string .
`;

export const tinyPatientDataWithBlankNodes = `
@prefix example: <http://example.com/> .
@prefix fhir: <http://hl7.org/fhir/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

example:Observation1
  fhir:subject _:Patient1 .

_:Patient1
  fhir:name "Garrett"^^xsd:string ;
  fhir:roommate _:Patient2 .

_:Patient2
  fhir:name "Rob"^^xsd:string ;
  fhir:roommate _:Patient1 .
`;

export const tinyPatientDataWithLanguageTags = `
@prefix example: <http://example.com/> .
@prefix fhir: <http://hl7.org/fhir/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

example:Observation1
  fhir:subject example:Patient1 ;
  fhir:langNotes "Cool Notes" ;
  fhir:langNotes "Cooler Notes"@en ;
  fhir:langNotes "Notas Geniales"@es ;
  fhir:langNotes "Notes Sympas"@fr .

example:Patient1
  fhir:langName "Jon" ;
  fhir:langName "John"@en ;
  fhir:langName "Juan"@es ;
  fhir:langName "Jean"@fr .
`;
