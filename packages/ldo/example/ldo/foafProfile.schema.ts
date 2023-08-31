import { Schema } from "shexj";

/**
 * =============================================================================
 * foafProfileSchema: ShexJ Schema for foafProfile
 * =============================================================================
 */
export const foafProfileSchema: Schema = {
  type: "Schema",
  shapes: [
    {
      id: "https://example.com/FoafProfile",
      type: "Shape",
      expression: {
        type: "EachOf",
        expressions: [
          {
            type: "TripleConstraint",
            predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            valueExpr: {
              type: "NodeConstraint",
              values: ["http://xmlns.com/foaf/0.1/Person"],
            },
            annotations: [
              {
                type: "Annotation",
                predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                object: {
                  value: "Defines the node as a Person (from foaf)",
                },
              },
            ],
          },
          {
            type: "TripleConstraint",
            predicate: "http://xmlns.com/foaf/0.1/name",
            valueExpr: {
              type: "NodeConstraint",
              datatype: "http://www.w3.org/2001/XMLSchema#string",
            },
            min: 0,
            max: 1,
            annotations: [
              {
                type: "Annotation",
                predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                object: {
                  value: "Define a person's name.",
                },
              },
            ],
          },
          {
            type: "TripleConstraint",
            predicate: "http://xmlns.com/foaf/0.1/img",
            valueExpr: {
              type: "NodeConstraint",
              datatype: "http://www.w3.org/2001/XMLSchema#string",
            },
            min: 0,
            max: 1,
            annotations: [
              {
                type: "Annotation",
                predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                object: {
                  value: "Photo link but in string form",
                },
              },
            ],
          },
          {
            type: "TripleConstraint",
            predicate: "http://xmlns.com/foaf/0.1/knows",
            valueExpr: "https://example.com/FoafProfile",
            min: 0,
            max: -1,
            annotations: [
              {
                type: "Annotation",
                predicate: "http://www.w3.org/2000/01/rdf-schema#comment",
                object: {
                  value: "A list of WebIds for all the people this user knows.",
                },
              },
            ],
          },
        ],
      },
      extra: ["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"],
    },
  ],
};
