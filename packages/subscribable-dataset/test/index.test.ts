import { describe, it, expect } from "vitest";
import {
  createSubscribableDataset,
  createSubscribableDatasetFactory,
  serializedToSubscribableDataset,
  SubscribableDataset,
  SubscribableDatasetFactory,
  TransactionDataset,
  TransactionDatasetFactory,
} from "../src/index";

describe("Exports", () => {
  it("Has all exports", () => {
    expect(createSubscribableDataset);
    expect(SubscribableDataset);
    expect(TransactionDataset);
    expect(SubscribableDatasetFactory);
    expect(TransactionDatasetFactory);
    expect(serializedToSubscribableDataset);
    expect(createSubscribableDatasetFactory);
  });
});
