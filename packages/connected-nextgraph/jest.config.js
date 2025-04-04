// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharedConfig = require("../../jest.config.js");
module.exports = {
  ...sharedConfig,
  rootDir: "./",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
};
