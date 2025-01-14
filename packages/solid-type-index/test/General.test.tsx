import { createSolidLdoDataset } from "@ldo/solid";
import {
  MY_BOOKMARKS_1_URI,
  MY_BOOKMARKS_2_URI,
  setupEmptyTypeIndex,
  setupFullTypeIndex,
  setUpServer,
  WEB_ID,
} from "./setUpServer";
import { getInstanceUris, getTypeRegistrations } from "../src/getTypeIndex";
import { initTypeIndex } from "../src/setTypeIndex";
import { TypeIndexProfileShapeType } from "../src/.ldo/profile.shapeTypes";

// Use an increased timeout, since the CSS server takes too much setup time.
jest.setTimeout(40_000);

describe("General Tests", () => {
  const s = setUpServer();

  it("gets the current typeindex", async () => {
    await setupFullTypeIndex(s);

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

  it("initializes the type index", async () => {
    await setupEmptyTypeIndex(s);

    const solidLdoDataset = createSolidLdoDataset();

    await initTypeIndex(WEB_ID, { solidLdoDataset });

    const profile = solidLdoDataset
      .usingType(TypeIndexProfileShapeType)
      .fromSubject(WEB_ID);
    console.log(solidLdoDataset.toString());

    expect(profile.privateTypeIndex?.["@id"]).toBeDefined();
    expect(profile.publicTypeIndex?.["@id"]).toBeDefined();
  });
});
