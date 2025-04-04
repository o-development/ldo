const sharedConfig = require("../../jest.config.js");
module.exports = {
  ...sharedConfig,
  rootDir: "./",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.setup.ts"],
};
