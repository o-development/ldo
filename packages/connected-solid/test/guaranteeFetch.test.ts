import { guaranteeFetch } from "../src/util/guaranteeFetch";
import { describe, it, expect } from "vitest";

describe("guaranteeFetch", () => {
  it("returns global fetch when no fetch is provided", () => {
    expect(guaranteeFetch()).toBe(fetch);
  });
});
