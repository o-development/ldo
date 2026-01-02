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

  it("should convert underscored names to camelCase", () => {
    expect(toValidTypescriptIdentifier("volunteer_profile")).toBe(
      "volunteerProfile",
    );
    expect(toValidTypescriptIdentifier("volunteer_profile_shapes")).toBe(
      "volunteerProfileShapes",
    );
  });

  it("should handle multiple consecutive separators", () => {
    expect(toValidTypescriptIdentifier("test--name")).toBe("testName");
    expect(toValidTypescriptIdentifier("test__name")).toBe("testName");
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
    expect(toValidTypescriptIdentifier("_myShape")).toBe("MyShape");
  });

  it("should handle mixed separators", () => {
    expect(toValidTypescriptIdentifier("my-test_shape")).toBe("myTestShape");
  });
});
