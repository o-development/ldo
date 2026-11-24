import type {
  tripleExpr,
  tripleExprOrRef,
} from "@ldo/traverser-shexj";

type PredicateCounts = Map<string, number>;

type TripleExprResolver = (
  id: string,
) => tripleExpr | undefined;

const INFINITY = Number.POSITIVE_INFINITY;

/**
 * ShExJ defaults maximum cardinality to 1.
 * A maximum of -1 represents unbounded cardinality.
 */
function getMax(max?: number): number {
  if (max === -1) {
    return INFINITY;
  }

  if (max !== undefined && max < 0) {
    throw new Error(`Invalid ShExJ maximum cardinality: ${max}`);
  }

  return max ?? 1;
}

/**
 * Adds the predicate counts of two expressions.
 * Used for EachOf.
 */
function addCounts(
  target: PredicateCounts,
  source: PredicateCounts,
): void {
  for (const [predicate, count] of source) {
    target.set(
      predicate,
      (target.get(predicate) ?? 0) + count,
    );
  }
}

/**
 * Keeps the maximum predicate counts across expressions.
 * Used for OneOf.
 */
function mergeMaxCounts(
  target: PredicateCounts,
  source: PredicateCounts,
): void {
  for (const [predicate, count] of source) {
    target.set(
      predicate,
      Math.max(target.get(predicate) ?? 0, count),
    );
  }
}

/**
 * Multiplies all predicate counts by a cardinality.
 */
function multiplyCounts(
  counts: PredicateCounts,
  multiplier: number,
): PredicateCounts {
  if (multiplier === 0) {
    return new Map();
  }

  const result: PredicateCounts = new Map();

  for (const [predicate, count] of counts) {
    if (count !== 0) {
      result.set(predicate, count * multiplier);
    }
  }

  return result;
}

/**
 * Calculates the maximum number of occurrences for each predicate
 * in a ShEx triple expression.
 *
 * EachOf: Adds the counts of its expressions.
 * OneOf: Takes the maximum count across its alternatives.
 * TripleConstraint: Uses its own maximum cardinality.
 *
 * References are resolved using the optional resolver.
 */
function getPredicateCounts(
  expression: tripleExprOrRef,
  resolveReference?: TripleExprResolver,
  resolvingReferences: ReadonlySet<string> = new Set(),
): PredicateCounts {

  // Resolve references to other triple expressions.
  if (typeof expression === "string") {
    if (!resolveReference) {
      throw new Error(
        `Cannot resolve ShEx triple expression reference: ${expression}`,
      );
    }

    if (resolvingReferences.has(expression)) {
      throw new Error(
        `Circular ShEx triple expression reference: ${expression}`,
      );
    }

    const referencedExpression = resolveReference(expression);

    if (!referencedExpression) {
      throw new Error(
        `Unknown ShEx triple expression reference: ${expression}`,
      );
    }

    const nextResolvingReferences = new Set(resolvingReferences);
    nextResolvingReferences.add(expression);

    return getPredicateCounts(
      referencedExpression,
      resolveReference,
      nextResolvingReferences,
    );
  }

  switch (expression.type) {
    case "TripleConstraint": {
      const max = getMax(expression.max);

      if (!expression.predicate || max === 0) {
        return new Map();
      }

      return new Map([
        [expression.predicate, max],
      ]);
    }

    case "EachOf": {
      const result: PredicateCounts = new Map();

      for (const child of expression.expressions) {
        addCounts(
          result,
          getPredicateCounts(
            child,
            resolveReference,
            resolvingReferences,
          ),
        );
      }

      return multiplyCounts(
        result,
        getMax(expression.max),
      );
    }

    case "OneOf": {
      const result: PredicateCounts = new Map();

      for (const child of expression.expressions) {
        mergeMaxCounts(
          result,
          getPredicateCounts(
            child,
            resolveReference,
            resolvingReferences,
          ),
        );
      }

      return multiplyCounts(
        result,
        getMax(expression.max),
      );
    }
  }
}

/**
 * Finds the predicates that can occur more than once
 * in a ShEx expression.
 */
export function getCollectionPredicates(
  expression: tripleExprOrRef,
  resolveReference?: TripleExprResolver,
): Set<string> {
  const counts = getPredicateCounts(
    expression,
    resolveReference,
  );

  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([predicate]) => predicate),
  );
}