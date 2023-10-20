// import type { App } from "@solid/community-server";
// import { getAuthenticatedFetch, ROOT_CONTAINER } from "./solidServer.helper";
// import type { SolidLdoDataset } from "../src/SolidLdoDataset";
// import { createSolidLdoDataset } from "../src/createSolidLdoDataset";
// import { ContainerRequester } from "../src/requester/ContainerRequester";
// import type { ContainerUri } from "../src/util/uriTypes";

// describe.skip("Container Requester", () => {
//   let _app: App;
//   let authFetch: typeof fetch;
//   let fetchMock: typeof fetch;
//   let solidLdoDataset: SolidLdoDataset;

//   beforeAll(async () => {
//     // Start up the server
//     // app = await createApp();
//     // await app.start();

//     authFetch = await getAuthenticatedFetch();
//   });

//   beforeEach(async () => {
//     fetchMock = jest.fn(authFetch);
//     solidLdoDataset = createSolidLdoDataset({ fetch: fetchMock });
//     // Create a new document called sample.ttl
//     await Promise.all([
//       authFetch(`${ROOT_CONTAINER}test_leaf/`, {
//         method: "POST",
//         headers: { "content-type": "text/turtle", slug: "sample.ttl" },
//         body: `@base <http://example.org/> .
//         @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
//         @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
//         @prefix foaf: <http://xmlns.com/foaf/0.1/> .
//         @prefix rel: <http://www.perceive.net/schemas/relationship/> .

//         <#green-goblin>
//             rel:enemyOf <#spiderman> ;
//             a foaf:Person ;    # in the context of the Marvel universe
//             foaf:name "Green Goblin" .

//         <#spiderman>
//             rel:enemyOf <#green-goblin> ;
//             a foaf:Person ;
//             foaf:name "Spiderman", "Человек-паук"@ru .`,
//       }),
//       authFetch(`${ROOT_COONTAINER}test_leaf/`, {
//         method: "PUT",
//         headers: { "content-type": "text/plain", slug: "sample.txt" },
//         body: `some text.`,
//       }),
//     ]);
//   });

//   afterEach(async () => {
//     await Promise.all([
//       authFetch(`${ROOT_COONTAINER}test_leaf/sample.ttl`, {
//         method: "DELETE",
//       }),
//       authFetch(`${ROOT_COONTAINER}test_leaf/sample2.ttl`, {
//         method: "DELETE",
//       }),
//       authFetch(`${ROOT_COONTAINER}test_leaf/sample.txt`, {
//         method: "DELETE",
//       }),
//       authFetch(`${ROOT_COONTAINER}test_leaf/sample2.txt`, {
//         method: "DELETE",
//       }),
//     ]);
//   });

//   it("Checks if a root container is a root container", async () => {
//     const leafRequester = new ContainerRequester(
//       `${ROOT_COONTAINER}` as ContainerUri,
//       solidLdoDataset.context,
//     );
//     const result = await leafRequester.isRootContainer();
//     expect(result).toBe(true);
//   });

//   it("Checks if a non root container is a root container", async () => {
//     const leafRequester = new ContainerRequester(
//       `${ROOT_COONTAINER}/test_leaf/`,
//       solidLdoDataset.context,
//     );
//     const result = await leafRequester.isRootContainer();
//     expect(result).toBe(false);
//   });
// });
