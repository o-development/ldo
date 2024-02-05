import { guaranteeFetch } from "../src/util/guaranteeFetch";
import crossFetch from "cross-fetch";

describe("guaranteeFetch", () => {
  it("returns crossfetch when no fetch is provided", () => {
    expect(guaranteeFetch()).toBe(crossFetch);
  });
});
