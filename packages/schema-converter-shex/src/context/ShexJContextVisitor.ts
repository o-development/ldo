import ShexJTraverser from "@ldo/traverser-shexj";
import type { JsonLdContextBuilder } from "./JsonLdContextBuilder";
import { getRdfTypesForTripleConstraint } from "../util/getRdfTypesForTripleConstraint";
import fs from "node:fs/promises";
import { shexjToTyping } from "../typing/shexjToTyping.js";
import parser from "@shexjs/parser";

/**
 * Visitor
 */
export const ShexJNameVisitor =
  ShexJTraverser.createVisitor<JsonLdContextBuilder>({
    Shape: {
      visitor: async (_shape, _context) => {},
    },
    Schema: {
      visitor: async (originalData, node, context) => {
        if (!originalData.imports) return;
        for (const path of originalData.imports) {
          const result = await fs.readFile(path, "utf8");
          const shexj = parser.construct(path).parse(result);
          const [typings, ctx] = await shexjToTyping(shexj);
          console.log(typings, ctx);
          context.addImport(path, typings, ctx);
        }
      },
    },
    TripleConstraint: {
      visitor: async (tripleConstraint, node, context) => {
        // Check that there's a triple constraint that is a type at the
        // same level if there is, use that as an rdfType
        const rdfTypes = getRdfTypesForTripleConstraint(node);

        // For Each RDF Type, add it
        rdfTypes.forEach((rdfType) => {
          if (tripleConstraint.valueExpr) {
            const isContainer =
              tripleConstraint.max !== undefined && tripleConstraint.max !== 1;
            if (typeof tripleConstraint.valueExpr === "string") {
              // TOOD handle string value expr
              context.addPredicate(
                tripleConstraint.predicate,
                { "@type": "@id" },
                isContainer,
                rdfType,
                tripleConstraint.annotations,
              );
              context.addSubject(
                tripleConstraint.valueExpr,
                rdfType,
                // tripleConstraint.annotations,
              );
            } else if (tripleConstraint.valueExpr.type === "NodeConstraint") {
              if (tripleConstraint.valueExpr.datatype) {
                context.addPredicate(
                  tripleConstraint.predicate,
                  {
                    "@type": tripleConstraint.valueExpr.datatype,
                  },
                  isContainer,
                  rdfType,
                  tripleConstraint.annotations,
                );
              } else if (
                tripleConstraint.valueExpr.nodeKind &&
                tripleConstraint.valueExpr.nodeKind !== "literal"
              ) {
                context.addPredicate(
                  tripleConstraint.predicate,
                  { "@type": "@id" },
                  isContainer,
                  rdfType,
                  tripleConstraint.annotations,
                );
              } else if (tripleConstraint.valueExpr.values) {
                context.addPredicate(
                  tripleConstraint.predicate,
                  {},
                  isContainer,
                  rdfType,
                  tripleConstraint.annotations,
                  tripleConstraint.valueExpr.values,
                );
              } else {
                context.addPredicate(
                  tripleConstraint.predicate,
                  {},
                  isContainer,
                  rdfType,
                  tripleConstraint.annotations,
                );
              }
            } else {
              context.addPredicate(
                tripleConstraint.predicate,
                {
                  "@type": "@id",
                },
                isContainer,
                rdfType,
                tripleConstraint.annotations,
              );
            }
          } else {
            context.addSubject(
              tripleConstraint.predicate,
              rdfType,
              tripleConstraint.annotations,
            );
          }
        });
      },
    },
    NodeConstraint: {
      visitor: async (nodeConstraint, node, context) => {
        if (nodeConstraint.values) {
          nodeConstraint.values.forEach((value) => {
            if (typeof value === "string") {
              context.addSubject(value);
            }
          });
        }
      },
    },
    IriStem: {
      visitor: async (iriStem, node, context) => {
        context.addSubject(iriStem.stem);
      },
    },
    // shapeDeclLabel: async (originalData, node, context) => {
    //   context.addSubject(originalData);
    // },
  });
