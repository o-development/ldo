import { describe, it, expect } from "vitest";
import {
  createDataset,
  createDatasetFactory,
  createDatasetFromSerializedInput,
  serializedToDataset,
  ExtendedDataset,
  ExtendedDatasetFactory,
} from "../src/index";

describe("Exports", () => {
  it("Has all exports", () => {
    expect(createDataset);
    expect(ExtendedDataset);
    expect(ExtendedDatasetFactory);
    expect(serializedToDataset);
    expect(createDatasetFactory);
    expect(createDatasetFromSerializedInput);
  });
});
