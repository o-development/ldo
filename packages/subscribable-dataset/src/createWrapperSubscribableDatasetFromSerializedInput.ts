import type { Quad } from "@rdfjs/types";
import type { ParserOptions } from "@ldo/rdf-utils";
import { createDatasetFromSerializedInput } from "@ldo/dataset";
import { createWrapperSubscribableDatasetFactory } from "./createWrapperSubscribableDataset";
import type WrapperSubscribableDataset from "./WrapperSubscribableDataset";

/**
 * Creates a SubscribableDataset with a string input that could be JSON-LD, Turtle, N-Triples, TriG, RDF*, or N3.
 * @param data A string representation of RDF Data in JSON-LD, Turtle, N-Triples, TriG, RDF*, or N3.
 * @param options Parser options: {
 *   format?: string;
 *   factory?: RDF.DataFactory;
 *   baseIRI?: string;
 *   blankNodePrefix?: string;
 * }
 * @returns A dataset
 */
export default async function createWrapperSubscribableDatasetDataserFromSerializedInput(
  data: string,
  options?: ParserOptions,
): Promise<WrapperSubscribableDataset<Quad>> {
  const datasetFactory = createWrapperSubscribableDatasetFactory();
  return createDatasetFromSerializedInput<WrapperSubscribableDataset<Quad>>(
    datasetFactory,
    data,
    options,
  );
}
