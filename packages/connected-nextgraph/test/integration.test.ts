import type { ConnectedLdoDataset } from "@ldo/connected";
import ng from "nextgraph";
import type { NextGraphConnectedPlugin } from "../src";
import { createNextGraphLdoDataset } from "../src/createNextGraphLdoDataset";

console.log("Running tests");

describe("NextGraph Plugin", () => {
  let nextgraphLdoDataset: ConnectedLdoDataset<NextGraphConnectedPlugin[]>;

  beforeEach(async () => {
    // Generate a wallet
    console.log("gen wallet");
    const [walletBinary, mnemonic] = await ng.gen_wallet_for_test(
      "lL2mo9Jtgz8yWN5PSaEMMftDGXyKJNbv9atQOygmeTcA",
    );
    console.log("open wallet");
    const openedWallet = await ng.wallet_open_with_mnemonic_words(
      walletBinary,
      mnemonic,
      [1, 2, 1, 2],
    );
    const userId = openedWallet.V0.personal_site;
    const walletName = openedWallet.V0.wallet_id;
    const session = await ng.session_in_memory_start(walletName, userId);
    const sessionId = session.session_id;
    console.log("after open wallet");

    // Get SessionId for that wallet
    nextgraphLdoDataset = createNextGraphLdoDataset();
    nextgraphLdoDataset.setContext("nextgraph", { sessionId });
    console.log("After ldo dataset");
  });

  it("trivial", () => {
    expect(true).toBe(true);
  });
});
