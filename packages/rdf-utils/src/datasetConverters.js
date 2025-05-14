"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datasetToString = datasetToString;
exports.datasetToJsonLd = datasetToJsonLd;
const n3_1 = require("n3");
function datasetToString(dataset, options) {
    const writer = new n3_1.Writer(options);
    const quadArr = [];
    for (const quad of dataset) {
        quadArr.push(quad);
    }
    return writer.quadsToString(quadArr);
}
async function datasetToJsonLd(_dataset, _context) {
    throw new Error("JSONLD serialization is not omplemented");
}
//# sourceMappingURL=datasetConverters.js.map