const sharedConfig = require("../../jest.config.js");
module.exports = {
  ...sharedConfig,
  rootDir: "./",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!(jose)/)"],
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  setupFiles: ["<rootDir>/jest.setup.ts"],
};
