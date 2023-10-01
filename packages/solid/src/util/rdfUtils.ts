import { parseRdf } from "@ldo/ldo";
import { namedNode, quad as createQuad } from "@rdfjs/data-model";
import type { Dataset } from "@rdfjs/types";
import type { ContainerUri } from "./uriTypes";
import { isContainerUri } from "./uriTypes";
import { NoncompliantPodError } from "../requester/results/error/NoncompliantPodError";
import { UnexpectedResourceError } from "../requester/results/error/ErrorResult";

export const ldpContains = namedNode("http://www.w3.org/ns/ldp#contains");
export const rdfType = namedNode(
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
);
export const ldpResource = namedNode("http://www.w3.org/ns/ldp#Resource");
export const ldpContainer = namedNode("http://www.w3.org/ns/ldp#Container");
export const ldpBasicContainer = namedNode(
  "http://www.w3.org/ns/ldp#BasicContainer",
);

export function getParentUri(uri: string): ContainerUri | undefined {
  const urlObject = new URL(uri);
  const pathItems = urlObject.pathname.split("/");
  if (
    pathItems.length < 2 ||
    (pathItems.length === 2 && pathItems[1].length === 0)
  ) {
    return undefined;
  }
  if (pathItems[pathItems.length - 1] === "") {
    pathItems.pop();
  }
  pathItems.pop();
  urlObject.pathname = `${pathItems.join("/")}/`;
  return urlObject.toString() as ContainerUri;
}

export function getSlug(uri: string): string {
  const urlObject = new URL(uri);
  const pathItems = urlObject.pathname.split("/");
  return pathItems[pathItems.length - 1] || pathItems[pathItems.length - 2];
}

export function deleteResourceRdfFromContainer(
  resourceUri: string,
  dataset: Dataset,
) {
  const parentUri = getParentUri(resourceUri);
  if (parentUri) {
    const parentNode = namedNode(parentUri);
    const resourceNode = namedNode(resourceUri);
    dataset.delete(
      createQuad(parentNode, ldpContains, resourceNode, parentNode),
    );
    dataset.deleteMatches(resourceNode, undefined, undefined, parentNode);
  }
}

export function addResourceRdfToContainer(
  resourceUri: string,
  dataset: Dataset,
) {
  const parentUri = getParentUri(resourceUri);
  if (parentUri) {
    const parentNode = namedNode(parentUri);
    const resourceNode = namedNode(resourceUri);
    dataset.add(createQuad(parentNode, ldpContains, resourceNode, parentNode));
    dataset.add(createQuad(resourceNode, rdfType, ldpResource, parentNode));
    if (isContainerUri(resourceUri)) {
      dataset.add(
        createQuad(resourceNode, rdfType, ldpBasicContainer, parentNode),
      );
      dataset.add(createQuad(resourceNode, rdfType, ldpContainer, parentNode));
    }
    addResourceRdfToContainer(parentUri, dataset);
  }
}

export async function addRawTurtleToDataset(
  rawTurtle: string,
  dataset: Dataset,
  baseUri: string,
): Promise<undefined | NoncompliantPodError> {
  let loadedDataset: Dataset;
  try {
    loadedDataset = await parseRdf(rawTurtle, {
      baseIRI: baseUri,
    });
  } catch (err) {
    const error = UnexpectedResourceError.fromThrown(baseUri, err);
    return new NoncompliantPodError(
      baseUri,
      `Request at ${baseUri} returned noncompliant turtle: ${error.message}`,
    );
  }

  const graphNode = namedNode(baseUri);
  // Destroy all triples that were once a part of this resouce
  dataset.deleteMatches(undefined, undefined, undefined, graphNode);
  // Add the triples from the fetched item
  dataset.addAll(
    loadedDataset.map((quad) =>
      createQuad(quad.subject, quad.predicate, quad.object, graphNode),
    ),
  );
}
