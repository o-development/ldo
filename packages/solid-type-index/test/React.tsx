import { setUpServer } from "./setUpServer";

// Use an increased timeout, since the CSS server takes too much setup time.
jest.setTimeout(40_000);

describe("React Tests", () => {
  setUpServer();
});
