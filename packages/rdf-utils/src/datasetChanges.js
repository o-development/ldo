"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changesToSparqlUpdate = changesToSparqlUpdate;
const data_model_1 = require("@rdfjs/data-model");
const datasetConverters_js_1 = require("./datasetConverters.js");
async function changesToSparqlUpdate(changes) {
    let output = "";
    if (changes.removed) {
        const removedTriples = changes.removed.map((quad) => (0, data_model_1.quad)(quad.subject, quad.predicate, quad.object));
        output += `DELETE DATA { ${await (0, datasetConverters_js_1.datasetToString)(removedTriples, {
            format: "N-Triples",
        })} }`;
    }
    if (changes.added && changes.removed) {
        output += "; ";
    }
    if (changes.added) {
        const addedTriples = changes.added.map((quad) => (0, data_model_1.quad)(quad.subject, quad.predicate, quad.object));
        output += `INSERT DATA { ${await (0, datasetConverters_js_1.datasetToString)(addedTriples, {
            format: "N-Triples",
        })} }`;
    }
    return output.replaceAll("\n", " ");
}
//# sourceMappingURL=datasetChanges.js.map