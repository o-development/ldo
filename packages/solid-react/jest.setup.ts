/* eslint-disable @typescript-eslint/no-explicit-any */
import "@inrupt/jest-jsdom-polyfills";

jest.mock("undici", () => {
  return {
    fetch: global.fetch,
  };
});
