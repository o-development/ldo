import ShexJTraverser from "@ldo/traverser-shexj";
import type { JsonLdContextBuilder } from "./JsonLdContextBuilder";

/**
 * Visitor
 */
export const ShexJNameVisitor =
  ShexJTraverser.createVisitor<JsonLdContextBuilder>({
    Shape: {
      visitor: async (_shape, _context) => {},
    },
    TripleConstraint: {
      visitor: async (tripleConstraint, context) => {
        // TODO: check that there's a triple constraint that is a type at the
        // same level if there is, use that as an rdfType
        if (tripleConstraint.valueExpr) {
          const isContainer =
            tripleConstraint.max !== undefined && tripleConstraint.max !== 1;
          if (typeof tripleConstraint.valueExpr === "string") {
            // TOOD handle string value expr
          } else if (tripleConstraint.valueExpr.type === "NodeConstraint") {
            if (tripleConstraint.valueExpr.datatype) {
              context.addPredicate(
                tripleConstraint.predicate,
                {
                  "@type": tripleConstraint.valueExpr.datatype,
                },
                isContainer,
                undefined,
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
                undefined,
                tripleConstraint.annotations,
              );
            } else {
              context.addPredicate(
                tripleConstraint.predicate,
                {},
                isContainer,
                undefined,
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
              undefined,
              tripleConstraint.annotations,
            );
          }
        } else {
          context.addSubject(
            tripleConstraint.predicate,
            undefined,
            tripleConstraint.annotations,
          );
        }
      },
    },
    NodeConstraint: {
      visitor: async (nodeConstraint, context) => {
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
      visitor: async (iriStem, context) => {
        context.addSubject(iriStem.stem);
      },
    },
  });
