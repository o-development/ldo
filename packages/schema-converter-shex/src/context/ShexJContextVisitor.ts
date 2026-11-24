import ShexJTraverser from "@ldo/traverser-shexj";
import type { JsonLdContextBuilder } from "./JsonLdContextBuilder";
import { getRdfTypesForTripleConstraint } from "../util/getRdfTypesForTripleConstraint";
import { getCollectionPredicates } from "./util/getCollectionConstraints";

const collectionConstraintsByContext = new WeakMap<
  JsonLdContextBuilder,
  WeakSet<object>
>();

function getCollectionConstraints(
  context: JsonLdContextBuilder,
): WeakSet<object> {
  let constraints = collectionConstraintsByContext.get(context);

  if (!constraints) {
    constraints = new WeakSet<object>();
    collectionConstraintsByContext.set(context, constraints);
  }

  return constraints;
}

/**
 * Visitor
 */
export const ShexJNameVisitor =
  ShexJTraverser.createVisitor<JsonLdContextBuilder>({
    Shape: {
      visitor: async (shape, _node, context) => {
        if (!shape.expression) {
          return;
        }

        const collectionPredicates = getCollectionPredicates(
          shape.expression,
        );

        const collectionConstraints = getCollectionConstraints(context);

        // Mark all TripleConstraints belonging to collection predicates.
        function markCollectionConstraints(expression: any): void {
          if (expression.type === "TripleConstraint") {
            if (collectionPredicates.has(expression.predicate)) {
              collectionConstraints.add(expression);
            }
          } else if (
            expression.type === "EachOf" ||
            expression.type === "OneOf"
          ) {
            expression.expressions?.forEach(
              markCollectionConstraints,
            );
          } else {
            throw new Error(
              `Unsupported ShEx triple expression: ${expression.type}`,
            );
          }
        }

        markCollectionConstraints(shape.expression);
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
            const isContainer = getCollectionConstraints(context).has(
              tripleConstraint,
            );
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
  });
