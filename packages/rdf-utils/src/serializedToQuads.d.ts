import type { Quad } from "@rdfjs/types";
import type { ParserOptions as ParserOptionsImport } from "n3";
export type ParserOptions = ParserOptionsImport;
export declare function serializedToQuads(data: string, options?: ParserOptions): Promise<Quad[]>;
//# sourceMappingURL=serializedToQuads.d.ts.map