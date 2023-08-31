import { createDataset } from "../src";
import testDataset from "./dataset.testHelper";

describe("ExtendedDataset", () => {
  testDataset({
    dataset: createDataset,
  });
});
