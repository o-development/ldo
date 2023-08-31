import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import type { ParserOptions } from "n3";
import { Parser } from "n3";
// import { Readable } from "readable-stream";
// import ParserJsonld from "@rdfjs/parser-jsonld";

/**
 * Creates a dataset with a string input that could be SON-LD, Turtle, N-Triples, TriG, RDF*, or N3.
 * @param datasetFactory A datasetFactory that will initialize a returned dataset.\
 * @param data A string representation of RDF Data in JSON-LD, Turtle, N-Triples, TriG, RDF*, or N3.
 * @param options Parser options: {
 *   format?: string;
 *   factory?: RDF.DataFactory;
 *   baseIRI?: string;
 *   blankNodePrefix?: string;
 * }
 * @returns A dataset
 */
export default async function createDatasetFromSerializedInput<
  ReturnDataset extends Dataset = Dataset,
>(
  datasetFactory: DatasetFactory<Quad>,
  data: string,
  options?: ParserOptions,
): Promise<ReturnDataset> {
  // JSON-LD Parsing
  if (options && options.format === "application/json-ld") {
    throw new Error("Not Implemented");
    // return new Promise((resolve, reject) => {
    //   JSON.parse(data);
    //   const parserJsonld = new ParserJsonld();

    //   const input = new Readable({
    //     read: () => {
    //       input.push(data);
    //       input.push(null);
    //     },
    //   });

    //   const output = parserJsonld.import(input);
    //   const quads: Quad[] = [];
    //   output.on("data", (quad) => {
    //     quads.push(quad);
    //   });
    //   output.on("end", () => {
    //     resolve((datasetFactory.dataset(quads) as unknown) as ReturnDataset);
    //   });
    //   /* istanbul ignore next */
    //   output.on("error", (err) => {
    //     /* istanbul ignore next */
    //     reject(err);
    //   });
    // });
  }
  // N3 Parsing
  const parser = new Parser(options as ParserOptions);
  const quads = parser.parse(data);
  return datasetFactory.dataset(quads) as unknown as ReturnDataset;
}
