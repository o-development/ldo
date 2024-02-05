import { setUpServer } from "./setUpServer";

describe("useSubject", () => {
  setUpServer();

  it("trivial", () => {
    expect(true).toBe(true);
  });
});
