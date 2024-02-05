import {
  AggregateError,
  ErrorResult,
  ResourceError,
  UnexpectedResourceError,
} from "../src/requester/results/error/ErrorResult";
import { InvalidUriError } from "../src/requester/results/error/InvalidUriError";

describe("ErrorResult", () => {
  describe("fromThrown", () => {
    it("returns an UnexpecteResourceError if a string is provided", () => {
      expect(
        UnexpectedResourceError.fromThrown("https://example.com/", "hello")
          .message,
      ).toBe("hello");
    });

    it("returns an UnexpecteResourceError if an odd valud is provided", () => {
      expect(
        UnexpectedResourceError.fromThrown("https://example.com/", 5).message,
      ).toBe("Error of type number thrown: 5");
    });
  });

  describe("AggregateError", () => {
    it("flattens aggregate errors provided to the constructor", () => {
      const err1 = UnexpectedResourceError.fromThrown("https://abc.com", "1");
      const err2 = UnexpectedResourceError.fromThrown("https://abc.com", "2");
      const err3 = UnexpectedResourceError.fromThrown("https://abc.com", "3");
      const err4 = UnexpectedResourceError.fromThrown("https://abc.com", "4");
      const aggErr1 = new AggregateError([err1, err2]);
      const aggErr2 = new AggregateError([err3, err4]);
      const finalAgg = new AggregateError([aggErr1, aggErr2]);
      expect(finalAgg.errors.length).toBe(4);
    });
  });

  describe("default messages", () => {
    class ConcreteResourceError extends ResourceError {
      readonly type = "concreteResourceError" as const;
    }
    class ConcreteErrorResult extends ErrorResult {
      readonly type = "concreteErrorResult" as const;
    }

    it("ResourceError fallsback to a default message if none is provided", () => {
      expect(new ConcreteResourceError("https://example.com/").message).toBe(
        "An unkown error for https://example.com/",
      );
    });

    it("ErrorResult fallsback to a default message if none is provided", () => {
      expect(new ConcreteErrorResult().message).toBe(
        "An unkown error was encountered.",
      );
    });

    it("InvalidUriError fallsback to a default message if none is provided", () => {
      expect(new InvalidUriError("https://example.com/").message).toBe(
        "https://example.com/ is an invalid uri.",
      );
    });
  });
});
