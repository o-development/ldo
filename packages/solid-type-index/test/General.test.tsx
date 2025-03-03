import { createSolidLdoDataset } from "@ldo/solid";
import {
  MY_BOOKMARKS_1_URI,
  MY_BOOKMARKS_2_URI,
  PRIVATE_TYPE_INDEX_URI,
  PUBLIC_TYPE_INDEX_URI,
  ROOT_CONTAINER,
  setupEmptyTypeIndex,
  setupFullTypeIndex,
  setUpServer,
  WEB_ID,
} from "./setUpServer";
import { getInstanceUris, getTypeRegistrations } from "../src/getTypeIndex";
import {
  addRegistration,
  initTypeIndex,
  removeRegistration,
} from "../src/setTypeIndex";
import { TypeIndexProfileShapeType } from "../src/.ldo/profile.shapeTypes";
import { namedNode } from "@rdfjs/dataset";
import { INSTANCE } from "../src/constants";

// Use an increased timeout, since the CSS server takes too much setup time.
jest.setTimeout(40_000);

const ADDRESS_BOOK = "http://www.w3.org/2006/vcard/ns#AddressBook";
const BOOKMARK = "http://www.w3.org/2002/01/bookmark#Bookmark";
const EXAMPLE_THING = "https://example.com/ExampleThing";

describe("General Tests", () => {
  const s = setUpServer();

  it("gets the current typeindex", async () => {
    await setupFullTypeIndex(s);

    const solidLdoDataset = createSolidLdoDataset();
    const typeRegistrations = await getTypeRegistrations(WEB_ID, {
      solidLdoDataset,
    });
    const addressBookUris = await getInstanceUris(
      ADDRESS_BOOK,
      typeRegistrations.toArray(),
      { solidLdoDataset },
    );
    expect(addressBookUris).toEqual(
      expect.arrayContaining([
        "https://example.com/myPrivateAddressBook.ttl",
        "https://example.com/myPublicAddressBook.ttl",
      ]),
    );
    const bookmarkUris = await getInstanceUris(
      BOOKMARK,
      typeRegistrations.toArray(),
      {
        solidLdoDataset,
      },
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

    expect(profile.privateTypeIndex?.toArray()[0]?.["@id"]).toBeDefined();
    expect(profile.publicTypeIndex?.toArray()[0]?.["@id"]).toBeDefined();
  });

  it("Adds to the typeIndex", async () => {
    await setupFullTypeIndex(s);

    const solidLdoDataset = createSolidLdoDataset();

    await getTypeRegistrations(WEB_ID, { solidLdoDataset });

    const transaction = solidLdoDataset.startTransaction();
    addRegistration(
      PUBLIC_TYPE_INDEX_URI,
      ADDRESS_BOOK,
      { instance: ["https://example.com/AdressBook3"] },
      { solidLdoDataset: transaction },
    );
    addRegistration(
      PRIVATE_TYPE_INDEX_URI,
      EXAMPLE_THING,
      { instanceContainer: ["https://example.com/ExampleInstance"] },
      { solidLdoDataset: transaction },
    );
    const { added, removed } = transaction.getChanges();

    const existingRegistration = namedNode(
      "http://localhost:3003/example/profile/publicTypeIndex.ttl#ab09fd",
    );

    expect(removed).not.toBeDefined();
    expect(added?.size).toBe(4);
    expect(added?.match(existingRegistration).size).toBe(1);
    expect(
      added?.match(
        existingRegistration,
        namedNode(INSTANCE),
        namedNode("https://example.com/AdressBook3"),
        namedNode("http://localhost:3003/example/profile/publicTypeIndex.ttl"),
      ).size,
    ).toBe(1);
  });

  it("Removes from the typeIndex", async () => {
    await setupFullTypeIndex(s);

    const solidLdoDataset = createSolidLdoDataset();

    await getTypeRegistrations(WEB_ID, { solidLdoDataset });

    const transaction = solidLdoDataset.startTransaction();
    removeRegistration(
      PUBLIC_TYPE_INDEX_URI,
      ADDRESS_BOOK,
      { instance: ["https://example.com/myPublicAddressBook.ttl"] },
      { solidLdoDataset: transaction },
    );
    removeRegistration(
      PRIVATE_TYPE_INDEX_URI,
      BOOKMARK,
      { instanceContainer: [`${ROOT_CONTAINER}myBookmarks/`] },
      { solidLdoDataset: transaction },
    );
    const { added, removed } = transaction.getChanges();

    expect(added).not.toBeDefined();
    expect(removed?.size).toBe(2);
  });
});
