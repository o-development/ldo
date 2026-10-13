import { describe, it } from "vitest";

describe("Composables for Solid", () => {
  describe("useSolidAuth", () => {
    it.todo("should provide a reactive auth session");
  });
  describe("useRootContainerFor", () => {
    it.todo("should return reactive root container on success");
    it.todo("should return undefined on failure");
    it.todo("should retry when authentication state changes");
  });
  describe("useResource reacting to auth session", () => {
    it.todo(
      "should return reactive resource and refetch it if authentication state changes",
    );
  });
});
