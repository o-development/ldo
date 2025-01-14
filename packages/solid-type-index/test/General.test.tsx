import { createSolidLdoDataset } from "@ldo/solid";
import {
  MY_BOOKMARKS_1_URI,
  MY_BOOKMARKS_2_URI,
  setUpServer,
  WEB_ID,
} from "./setUpServer";
import { getInstanceUris, getTypeRegistrations } from "../src/getTypeIndex";

// Use an increased timeout, since the CSS server takes too much setup time.
jest.setTimeout(40_000);

describe("General Tests", () => {
  setUpServer();

  it("gets the current typeindex", async () => {
    const solidLdoDataset = createSolidLdoDataset();
    const typeRegistrations = await getTypeRegistrations(WEB_ID, {
      solidLdoDataset,
    });
    const addressBookUris = await getInstanceUris(
      "http://www.w3.org/2006/vcard/ns#AddressBook",
      typeRegistrations,
      { solidLdoDataset },
    );
    expect(addressBookUris).toEqual(
      expect.arrayContaining([
        "https://example.com/myPrivateAddressBook.ttl",
        "https://example.com/myPublicAddressBook.ttl",
      ]),
    );
    const bookmarkUris = await getInstanceUris(
      "http://www.w3.org/2002/01/bookmark#Bookmark",
      typeRegistrations,
      { solidLdoDataset },
    );
    expect(bookmarkUris).toEqual(
      expect.arrayContaining([MY_BOOKMARKS_1_URI, MY_BOOKMARKS_2_URI]),
    );
  });
});
