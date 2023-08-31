import { BrokenAvatarTransformer } from "./AvatarBrokenTransformer";
import { AvatarErroringTransformer } from "./AvatarErroringTransformer";
import { aang } from "./sampleData";

describe("Avatar", () => {
  it("Throws an error before entering an infinite loop", async () => {
    await expect(
      BrokenAvatarTransformer.transform(aang, "Bender", undefined)
    ).rejects.toThrow(
      `Circular dependency found. Use the 'setReturnPointer' function. The loop includes the 'Bender' type`
    );
  });

  it("Bubbles errors", async () => {
    await expect(
      AvatarErroringTransformer.transform(aang, "Bender", undefined)
    ).rejects.toThrow("No Non Benders Allowed");
  });
});
