const sharedConfig = require("../../jest.config.js");
module.exports = {
  ...sharedConfig,
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "jsdom",
  rootDir: "./",
  transformIgnorePatterns: ["undici"],
  injectGlobals: true,
  testEnvironment: "<rootDir>/test/environment/customEnvironment.ts",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
