// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
const monorepoRoot = path.resolve(__dirname);

module.exports = {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    [`^@ldo/(.*)$`]: `${monorepoRoot}/packages/$1/src/index.ts`,
  },
  testEnvironment: "node",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/coverage/",
    "/test/",
  ],
  globals: {},
};
