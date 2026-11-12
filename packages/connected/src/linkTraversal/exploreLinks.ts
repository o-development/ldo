import type { ConnectedPlugin } from "../types/ConnectedPlugin";
import type { SubjectNode } from "@ldo/rdf-utils";
import type { LQInput } from "../types/ILinkQuery";
// import { BasicLdSet } from "@ldo/jsonld-dataset-proxy";
import type { IConnectedLdoDataset } from "../types/IConnectedLdoDataset";
// import { createTrackingProxyBuilder } from "../trackingProxy/createTrackingProxy";
import type { nodeEventListener } from "@ldo/subscribable-dataset";
import type { Quad } from "@rdfjs/types";
import type { TermWrapper, ITermWrapperConstructor } from "@rdfjs/wrapper";
import { createTrackingDataset } from "../tracking/createTrackingDataset.js";

/**
 * @internal
 */
interface ExploreLinksOptions<Plugins extends ConnectedPlugin[]> {
  onResourceEncountered?: (
    resource: Plugins[number]["types"]["resource"],
  ) => Promise<void>;
  onCoveredDataChanged?: nodeEventListener<Quad>;
  shouldRefreshResources?: boolean;
}

/**
 * @internal
 */
export async function exploreLinks<
  Type extends TermWrapper,
  Plugins extends ConnectedPlugin[],
>(
  dataset: IConnectedLdoDataset<Plugins>,
  termWrapperClass: ITermWrapperConstructor<Type>,
  startingResource: Plugins[number]["types"]["resource"],
  startingSubject: SubjectNode | string,
  queryInput: LQInput<Type>,
  options?: ExploreLinksOptions<Plugins>,
): Promise<void> {
  // Do an initial check of the resources.
  const readResult = options?.shouldRefreshResources
    ? await startingResource.read()
    : await startingResource.readIfUnfetched();
  if (readResult.isError) return;

  if (options?.onResourceEncountered)
    await options?.onResourceEncountered(startingResource);

  const maybeTrackingDataset = options?.onCoveredDataChanged
    ? createTrackingDataset(dataset, options.onCoveredDataChanged)
    : dataset;

  // options?.onCoveredDataChanged
  //   ? createTrackingDataset()
  //   : /*
  //   TODO
  //   options?.onCoveredDataChanged
  //   ? createTrackingProxyBuilder(
  //       dataset,
  //       shapeType,
  //       options?.onCoveredDataChanged,
  //     )
  // :*/ dataset.usingType(termWrapperClass);
  const ldObject = maybeTrackingDataset
    .usingType(termWrapperClass)
    .fromSubject(startingSubject);

  const encounteredDuringThisExploration = new Set<string>([
    startingResource.uri,
  ]);

  // Recursively explore the rest
  await exploreLinksRecursive(
    dataset,
    ldObject,
    queryInput,
    encounteredDuringThisExploration,
    options,
  );
}

export async function exploreLinksRecursive<
  Type extends TermWrapper,
  Plugins extends ConnectedPlugin[],
>(
  dataset: IConnectedLdoDataset<Plugins>,
  termWrapper: Type,
  queryInput: LQInput<Type>,
  encounteredDuringThisExploration: Set<string>,
  options?: ExploreLinksOptions<Plugins>,
): Promise<void> {
  const shouldFetch = shouldFetchResource(
    dataset,
    termWrapper,
    queryInput,
    encounteredDuringThisExploration,
  );

  const resourceToFetch = dataset.getResource(termWrapper.value);
  if (shouldFetch) {
    const readResult = options?.shouldRefreshResources
      ? await resourceToFetch.read()
      : await resourceToFetch.readIfUnfetched();
    // If there was an error with the read, the traversal is done.
    if (readResult.isError) {
      return;
    }
  }

  if (!encounteredDuringThisExploration.has(resourceToFetch.uri)) {
    encounteredDuringThisExploration.add(resourceToFetch.uri);
    if (options?.onResourceEncountered)
      await options.onResourceEncountered(resourceToFetch);
  }
  // Recurse through the other elements
  await Promise.all(
    Object.entries(queryInput).map(async ([queryKey, queryValue]) => {
      if (
        queryValue != undefined &&
        queryValue !== true &&
        termWrapper[queryKey] != undefined
      ) {
        if (isSetLike(termWrapper[queryKey])) {
          await Promise.all(
            Array.from(termWrapper[queryKey]).map(async (item) => {
              await exploreLinksRecursive(
                dataset,
                item as TermWrapper,
                queryValue,
                encounteredDuringThisExploration,
                options,
              );
            }),
          );
        } else {
          await exploreLinksRecursive(
            dataset,
            termWrapper[queryKey],
            queryValue,
            encounteredDuringThisExploration,
            options,
          );
        }
      }
    }),
  );
}

/**
 * Determines if a resource needs to be fetched based on given data
 */
export function shouldFetchResource<
  Type extends TermWrapper,
  Plugins extends ConnectedPlugin[],
>(
  dataset: IConnectedLdoDataset<Plugins>,
  termWrapper: Type,
  queryInput: LQInput<Type>,
  encounteredDuringThisExploration: Set<string>,
): boolean {
  const linkedResourceUri: string | undefined = termWrapper.value;

  // If it's a blank node, no need to fetch
  if (!linkedResourceUri) return false;
  const linkedResource = dataset.getResource(linkedResourceUri);
  // If we've already explored the resource in this exploration, do not fetch
  if (encounteredDuringThisExploration.has(linkedResource.uri)) return false;

  return Object.entries(queryInput).some(([queryKey, queryValue]) => {
    // If value is undefined then no need to fetch
    if (!queryValue) return false;
    // Always fetch if there's a set in the object
    if (isSetLike(termWrapper[queryKey])) return true;
    // Fetch if a singleton set is not present
    if (termWrapper[queryKey] == undefined) return true;
    // Otherwise no need t to fetch
    return false;
  });
}

function isSetLike<T>(obj: unknown): obj is Set<T> {
  return (
    obj instanceof Set ||
    (typeof obj === "object" &&
      obj !== null &&
      "add" in obj &&
      "has" in obj &&
      Symbol.iterator in obj)
  );
}
