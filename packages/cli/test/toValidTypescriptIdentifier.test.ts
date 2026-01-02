import { toValidTypescriptIdentifier } from "../src/util/toValidTypescriptIdentifier";

describe("toValidTypescriptIdentifier", () => {
  it("should handle simple names without special characters", () => {
    expect(toValidTypescriptIdentifier("myShape")).toBe("myShape");
  });

  it("should convert hyphenated names to camelCase", () => {
    expect(toValidTypescriptIdentifier("volunteer-profile")).toBe(
      "volunteerProfile",
    );
    expect(toValidTypescriptIdentifier("volunteer-profile-shapes")).toBe(
      "volunteerProfileShapes",
    );
  });

  it("should preserve underscores since they are valid in identifiers", () => {
    expect(toValidTypescriptIdentifier("volunteer_profile")).toBe(
      "volunteer_profile",
    );
    expect(toValidTypescriptIdentifier("volunteer_profile_shapes")).toBe(
      "volunteer_profile_shapes",
    );
  });

  it("should handle multiple consecutive hyphens", () => {
    expect(toValidTypescriptIdentifier("test--name")).toBe("testName");
  });

  it("should handle names starting with numbers by prepending underscore", () => {
    expect(toValidTypescriptIdentifier("123shape")).toBe("_123shape");
    expect(toValidTypescriptIdentifier("1-shapes")).toBe("_1Shapes");
  });

  it("should remove invalid characters", () => {
    expect(toValidTypescriptIdentifier("my@shape")).toBe("myshape");
    expect(toValidTypescriptIdentifier("my!shape")).toBe("myshape");
    expect(toValidTypescriptIdentifier("my#shape")).toBe("myshape");
  });

  it("should preserve dollar signs and underscores", () => {
    expect(toValidTypescriptIdentifier("$myShape")).toBe("$myShape");
    expect(toValidTypescriptIdentifier("_myShape")).toBe("_myShape");
  });

  it("should handle empty strings by returning underscore", () => {
    expect(toValidTypescriptIdentifier("")).toBe("_");
  });

  it("should handle strings that become empty after cleaning", () => {
    expect(toValidTypescriptIdentifier("---")).toBe("_");
    expect(toValidTypescriptIdentifier("@#%")).toBe("_");
  });

  it("should handle mixed hyphens and underscores", () => {
    expect(toValidTypescriptIdentifier("my-test_shape")).toBe("myTest_shape");
  });
});
