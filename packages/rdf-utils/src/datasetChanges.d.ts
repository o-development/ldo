import type { BaseQuad, Dataset, Quad } from "@rdfjs/types";
export interface DatasetChanges<InAndOutQuad extends BaseQuad = BaseQuad> {
    added?: Dataset<InAndOutQuad, InAndOutQuad>;
    removed?: Dataset<InAndOutQuad, InAndOutQuad>;
}
export declare function changesToSparqlUpdate(changes: DatasetChanges<Quad>): Promise<string>;
//# sourceMappingURL=datasetChanges.d.ts.map