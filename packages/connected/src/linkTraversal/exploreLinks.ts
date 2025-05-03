import type { LdoBase, ShapeType } from "@ldo/ldo";
import type { ConnectedPlugin } from "../types/ConnectedPlugin";
import type { SubjectNode } from "@ldo/rdf-utils";
import type { LQInput } from "../types/ILinkQuery";
import { BasicLdSet } from "@ldo/jsonld-dataset-proxy";
import type { IConnectedLdoDataset } from "../types/IConnectedLdoDataset";

interface ExploreLinksOptions<Plugins extends ConnectedPlugin[]> {
  onResourceEncountered?: (
    resource: Plugins[number]["types"]["resource"],
  ) => void;
  shouldRefreshResources?: boolean;
}

export async function exploreLinks<
  Type extends LdoBase,
  Plugins extends ConnectedPlugin[],
>(
  dataset: IConnectedLdoDataset<Plugins>,
  shapeType: ShapeType<Type>,
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

  const ldObject = dataset.usingType(shapeType).fromSubject(startingSubject);

  const fetchedDuringThisExploration = new Set<string>([startingResource.uri]);

  // Recursively explore the rest
  await exploreLinksRecursive(
    dataset,
    ldObject,
    queryInput,
    fetchedDuringThisExploration,
    options,
  );
}

export async function exploreLinksRecursive<
  Type extends LdoBase,
  Plugins extends ConnectedPlugin[],
>(
  dataset: IConnectedLdoDataset<Plugins>,
  ldObject: Type,
  queryInput: LQInput<Type>,
  fetchedDuringThisExploration: Set<string>,
  options?: ExploreLinksOptions<Plugins>,
): Promise<void> {
  const shouldFetch = shouldFetchResource(
    dataset,
    ldObject,
    queryInput,
    fetchedDuringThisExploration,
  );
  if (shouldFetch) {
    const resourceToFetch = dataset.getResource(ldObject["@id"]);
    const readResult = options?.shouldRefreshResources
      ? await resourceToFetch.read()
      : await resourceToFetch.readIfUnfetched();
    // If there was an error with the read, the traversal is done.
    if (readResult.isError) {
      return;
    }
    fetchedDuringThisExploration.add(resourceToFetch.uri);
  }
  // Recurse through the other elemenets
  await Promise.all(
    Object.entries(queryInput).map(async ([queryKey, queryValue]) => {
      if (
        queryValue != undefined &&
        queryValue !== true &&
        ldObject[queryKey] != undefined
      ) {
        if (ldObject[queryKey] instanceof BasicLdSet) {
          await Promise.all(
            ldObject[queryKey].map(async (item) => {
              await exploreLinksRecursive(
                dataset,
                item,
                queryValue,
                fetchedDuringThisExploration,
                options,
              );
            }),
          );
        } else {
          await exploreLinksRecursive(
            dataset,
            ldObject[queryKey],
            queryValue,
            fetchedDuringThisExploration,
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
  Type extends LdoBase,
  Plugins extends ConnectedPlugin[],
>(
  dataset: IConnectedLdoDataset<Plugins>,
  ldObject: Type,
  queryInput: LQInput<Type>,
  fetchedDuringThisExploration: Set<string>,
): boolean {
  const linkedResourceUri: string | undefined = ldObject["@id"];
  // If it's a blank node, no need to fetch
  if (!linkedResourceUri) return false;
  const linkedResource = dataset.getResource(linkedResourceUri);
  // If we've already explored the resource in this exporation, do not fetch
  if (fetchedDuringThisExploration.has(linkedResource.uri)) return false;

  return Object.entries(queryInput).some(([queryKey, queryValue]) => {
    // If value is undefined then no need to fetch
    if (!queryValue) return false;
    // Always fetch if there's a set in the object
    if (ldObject[queryKey] instanceof BasicLdSet) return true;
    // Fetch if a singleton set is not present
    if (ldObject[queryKey] == undefined) return true;
    // Otherwise no need t to fetch
    return false;
  });
}
