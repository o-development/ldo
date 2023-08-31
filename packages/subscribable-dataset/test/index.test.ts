import {
  createSubscribableDataset,
  createSubscribableDatasetFactory,
  serializedToSubscribableDataset,
  ProxyTransactionalDataset,
  WrapperSubscribableDataset,
  WrapperSubscribableDatasetFactory,
} from "../src";

describe("Exports", () => {
  it("Has all exports", () => {
    expect(createSubscribableDataset);
    expect(ProxyTransactionalDataset);
    expect(WrapperSubscribableDataset);
    expect(WrapperSubscribableDatasetFactory);
    expect(serializedToSubscribableDataset);
    expect(createSubscribableDatasetFactory);
  });
});
