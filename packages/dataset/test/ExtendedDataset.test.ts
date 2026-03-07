import { createDataset } from "../src/index";
import testDataset from "./dataset.testHelper";

describe("ExtendedDataset", () => {
  testDataset({
    dataset: createDataset,
  });
});
