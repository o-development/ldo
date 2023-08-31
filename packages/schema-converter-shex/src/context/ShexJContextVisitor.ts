import ShexJTraverser from "shexj-traverser";
import { JsonLdContextBuilder } from "./JsonLdContextBuilder";

/**
 * Visitor
 */
export const ShexJNameVisitor =
  ShexJTraverser.createVisitor<JsonLdContextBuilder>({
    Shape: {
      visitor: async (shape, context) => {
        
      }
    },
    TripleConstraint: {
      visitor: async (tripleConstraint, context) => {
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
                tripleConstraint.annotations
              );
            } else if (
              tripleConstraint.valueExpr.nodeKind &&
              tripleConstraint.valueExpr.nodeKind !== "literal"
            ) {
              context.addPredicate(
                tripleConstraint.predicate,
                { "@type": "@id" },
                isContainer,
                tripleConstraint.annotations
              );
            } else {
              context.addPredicate(
                tripleConstraint.predicate,
                {},
                isContainer,
                tripleConstraint.annotations
              );
            }
          } else {
            context.addPredicate(
              tripleConstraint.predicate,
              {
                "@type": "@id",
              },
              isContainer,
              tripleConstraint.annotations
            );
          }
        } else {
          context.addSubject(
            tripleConstraint.predicate,
            tripleConstraint.annotations
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
