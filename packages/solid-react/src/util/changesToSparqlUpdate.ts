import { DatasetChanges } from "o-dataset-pack";
import { datasetToString } from "ldo/dist/datasetConverters";
import { Quad } from "@rdfjs/types";
import { quad as createQuad } from "@rdfjs/data-model";

// TODO: This file is a clone from the one in the base ldo library. This resused
// code should be put into a helper library once everything becomes a monorepo.
export async function changesToSparqlUpdate(changes: DatasetChanges<Quad>) {
  let output = "";
  if (changes.removed) {
    const removedTriples = changes.removed.map((quad) =>
      createQuad(quad.subject, quad.predicate, quad.object)
    );
    output += `DELETE DATA { ${await datasetToString(removedTriples, {
      format: "N-Triples",
    })} }`;
  }
  if (changes.added && changes.removed) {
    output += "; ";
  }
  if (changes.added) {
    const addedTriples = changes.added.map((quad) =>
      createQuad(quad.subject, quad.predicate, quad.object)
    );
    output += `INSERT DATA { ${await datasetToString(addedTriples, {
      format: "N-Triples",
    })} }`;
  }
  return output.replaceAll("\n", " ");
}
