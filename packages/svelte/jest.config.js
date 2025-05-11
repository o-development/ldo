// packages/svelte/jest.config.js

/** @type {import('jest').Config} */
const config = {
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ["src/**/*.{ts,svelte}"], // Focus coverage on your source files
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ["json", "text", "lcov", "html"],

  // The test environment that will be used for testing (jsdom for browser-like environment)
  testEnvironment: "jest-environment-jsdom",

  // A list of paths to modules that run some code to configure or set up the testing framework
  // before each test file in the suite.
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "<rootDir>/src/**/*.test.ts",
    "<rootDir>/src/**/*.spec.ts",
    "<rootDir>/test/**/*.test.ts", // Or wherever your tests are located
    "<rootDir>/test/**/*.spec.ts",
  ],

  // An array of file extensions your modules use
  moduleFileExtensions: ["ts", "js", "svelte", "json"],

  // A map from regular expressions to module names or to arrays of module names
  // that allow to stub out resources with a single module
  moduleNameMapper: {
    // Alias for SvelteKit-style $lib imports (if you use them)
    "^\\$lib(.*)$": "<rootDir>/src$1",
    // Mock CSS imports to prevent errors
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    // You can add mocks for other static assets if needed
    // '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.svelte$": [
      "svelte-jester", // Uses your svelte-jester@^5.0.0
      {
        preprocess: true, // This will automatically use svelte.config.js
        // Set to false if svelte.config.js is not found or not to be used.
        // You could also pass preprocess options directly here:
        // preprocess: require('svelte-preprocess')({ typescript: true })
      },
    ],
    "^.+\\.ts$": [
      // Changed from (ts|tsx) as tsx is less common in Svelte libs
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json", // Points to your package's tsconfig for type-safety
        // Example: disabling some TS diagnostics if they are noisy in tests
        // diagnostics: {
        //   ignoreCodes: ['TS151001']
        // }
      },
    ],
    // If you have .js files that need transpilation (e.g. using modern JS features not supported by Node version running Jest)
    // you might add a babel-jest transformer here. For a library mostly in TS, this might not be needed.
    // '^.+\\.js$': 'babel-jest',
  },

  // An array of regexp pattern strings that are matched against all source file paths before transformation.
  // If the file path matches any of the patterns, it will not be transformed.
  // This is important for node_modules that are published as ES modules but Jest runs in CJS by default.
  transformIgnorePatterns: [
    "/node_modules/(?!(svelte-routing|another-es-module-package)/)", // Adjust if you use ESM-only deps
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Optionally, if your project or tests are pure ESM, you might explore ESM support in Jest:
  // preset: 'ts-jest/presets/default-esm', // or 'ts-jest/presets/default-esm-legacy'
  // extensionsToTreatAsEsm: ['.ts', '.svelte'],
  // moduleNameMapper for ESM often needs to handle .js extensions in imports.
};

export default config;
