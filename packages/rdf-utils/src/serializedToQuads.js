"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializedToQuads = serializedToQuads;
const n3_1 = require("n3");
async function serializedToQuads(data, options) {
    if (options && options.format === "application/ld+json") {
        throw new Error("Not Implemented");
    }
    const parser = new n3_1.Parser(options);
    return parser.parse(data);
}
//# sourceMappingURL=serializedToQuads.js.map