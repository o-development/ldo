import { createDataset } from "../src.js";
import testDataset from "./dataset.testHelper.js";

describe("ExtendedDataset", () => {
  testDataset({
    dataset: createDataset,
  });
});
