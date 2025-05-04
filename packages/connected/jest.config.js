// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharedConfig = require("../../jest.config.js");
module.exports = {
  ...sharedConfig,
  rootDir: "./",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
  },
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
};
