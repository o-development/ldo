import type { DatasetCore, Quad } from "@rdfjs/types";
import type { ContextDefinition, JsonLdDocument } from "jsonld";
import type { WriterOptions as WriterOptionsImport } from "n3";
export type WriterOptions = WriterOptionsImport;
export declare function datasetToString(dataset: DatasetCore<Quad>, options: WriterOptions): string;
export declare function datasetToJsonLd(_dataset: DatasetCore, _context: ContextDefinition): Promise<JsonLdDocument>;
//# sourceMappingURL=datasetConverters.d.ts.map