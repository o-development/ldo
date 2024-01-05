import type { LdoBase, ShapeType } from "@ldo/ldo";
import { LdoDataset, startTransaction } from "@ldo/ldo";
import type { DatasetChanges, GraphNode, SubjectNode } from "@ldo/rdf-utils";
import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import type {
  UpdateResult,
  UpdateResultError,
} from "./requester/requests/updateDataResource";
import { AggregateError } from "./requester/results/error/ErrorResult";
import { InvalidUriError } from "./requester/results/error/InvalidUriError";
import type { AggregateSuccess } from "./requester/results/success/SuccessResult";
import type {
  UpdateDefaultGraphSuccess,
  UpdateSuccess,
} from "./requester/results/success/UpdateSuccess";
import type { Container } from "./resource/Container";
import type { Leaf } from "./resource/Leaf";
import type { ResourceResult } from "./resource/resourceResult/ResourceResult";
import type { ResourceGetterOptions } from "./ResourceStore";
import type { SolidLdoDatasetContext } from "./SolidLdoDatasetContext";
import { splitChangesByGraph } from "./util/splitChangesByGraph";
import type { ContainerUri, LeafUri } from "./util/uriTypes";
import { isContainerUri } from "./util/uriTypes";
import type { Resource } from "./resource/Resource";

/**
 * A SolidLdoDataset has all the functionality of an LdoDataset with the added
 * functionality of keeping track of fetched Solid Resources.
 *
 * It is recommended to use the { @link createSolidLdoDataset } to initialize
 * this class
 *
 * @example
 * ```typescript
 * import { createSolidLdoDataset } from "@ldo/solid";
 * import { ProfileShapeType } from "./.ldo/profile.shapeTypes.ts"
 *
 * // ...
 *
 * const solidLdoDataset = createSolidLdoDataset();
 *
 * const profileDocument = solidLdoDataset
 *   .getResource("https://example.com/profile");
 * await profileDocument.read();
 *
 * const profile = solidLdoDataset
 *   .using(ProfileShapeType)
 *   .fromSubject("https://example.com/profile#me");
 * ```
 */
export class SolidLdoDataset extends LdoDataset {
  /**
   * @internal
   */
  public context: SolidLdoDatasetContext;

  /**
   * @param context - SolidLdoDatasetContext
   * @param datasetFactory - An optional dataset factory
   * @param initialDataset - A set of triples to initialize this dataset
   */
  constructor(
    context: SolidLdoDatasetContext,
    datasetFactory: DatasetFactory,
    initialDataset?: Dataset,
  ) {
    super(datasetFactory, initialDataset);
    this.context = context;
  }

  /**
   * Retireves a representation (either a LeafResource or a ContainerResource)
   * of a Solid Resource at the given URI. This resource represents the
   * current state of the resource: whether it is currently fetched or in the
   * process of fetching as well as some information about it.
   *
   * @param uri - the URI of the resource
   * @param options - Special options for getting the resource
   *
   * @returns a Leaf or Container Resource
   *
   * @example
   * ```typescript
   * const profileDocument = solidLdoDataset
   *   .getResource("https://example.com/profile");
   * ```
   */
  getResource(uri: ContainerUri, options?: ResourceGetterOptions): Container;
  getResource(uri: LeafUri, options?: ResourceGetterOptions): Leaf;
  getResource(uri: string, options?: ResourceGetterOptions): Leaf | Container;
  getResource(uri: string, options?: ResourceGetterOptions): Leaf | Container {
    return this.context.resourceStore.get(uri, options);
  }

  /**
   * Given dataset changes, commit all changes made to the proper place
   * on Solid Pods.
   *
   * @param changes - A set of changes that should be applied to Solid Pods
   *
   * @returns an AggregateSuccess if successful and an AggregateError if not
   *
   * @example
   * ```typescript
   * const result = await solidLdoDataset.commitChangesToPod({
   *   added: createDataset([
   *     quad(namedNode("a"), namedNode("b"), namedNode("d"));
   *   ]),
   *   removed: createDataset([
   *     quad(namedNode("a"), namedNode("b"), namedNode("c"));
   *   ])
   * });
   * if (result.isError()) {
   *   // handle error
   * }
   * ```
   */
  async commitChangesToPod(
    changes: DatasetChanges<Quad>,
  ): Promise<
    | AggregateSuccess<
        ResourceResult<UpdateSuccess | UpdateDefaultGraphSuccess, Leaf>
      >
    | AggregateError<UpdateResultError | InvalidUriError>
  > {
    // Optimistically add changes to the datastore
    // this.bulk(changes);
    const changesByGraph = splitChangesByGraph(changes);

    // Iterate through all changes by graph in
    const results: [
      GraphNode,
      DatasetChanges<Quad>,
      UpdateResult | InvalidUriError | UpdateDefaultGraphSuccess,
    ][] = await Promise.all(
      Array.from(changesByGraph.entries()).map(
        async ([graph, datasetChanges]) => {
          if (graph.termType === "DefaultGraph") {
            // Undefined means that this is the default graph
            this.bulk(datasetChanges);
            return [
              graph,
              datasetChanges,
              {
                type: "updateDefaultGraphSuccess",
                isError: false,
              } as UpdateDefaultGraphSuccess,
            ];
          }
          if (isContainerUri(graph.value)) {
            return [
              graph,
              datasetChanges,
              new InvalidUriError(
                graph.value,
                `Container URIs are not allowed for custom data.`,
              ),
            ];
          }
          const resource = this.getResource(graph.value as LeafUri);
          return [graph, datasetChanges, await resource.update(datasetChanges)];
        },
      ),
    );

    // If one has errored, return error
    const errors = results.filter((result) => result[2].isError);

    if (errors.length > 0) {
      return new AggregateError(
        errors.map(
          (result) => result[2] as UpdateResultError | InvalidUriError,
        ),
      );
    }
    return {
      isError: false,
      type: "aggregateSuccess",
      results: results
        .map((result) => result[2])
        .filter(
          (result): result is ResourceResult<UpdateSuccess, Leaf> =>
            result.type === "updateSuccess" ||
            result.type === "updateDefaultGraphSuccess",
        ),
    };
  }

  /**
   * Shorthand for solidLdoDataset
   *   .usingType(shapeType)
   *   .write(...resources.map((r) => r.uri))
   *   .fromSubject(subject);
   * @param shapeType - The shapetype to represent the data
   * @param subject - A subject URI
   * @param resources - The resources changes to should written to
   */
  createData<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: string | SubjectNode,
    resource: Resource,
    ...additionalResources: Resource[]
  ): Type {
    const resources = [resource, ...additionalResources];
    const linkedDataObject = this.usingType(shapeType)
      .write(...resources.map((r) => r.uri))
      .fromSubject(subject);
    startTransaction(linkedDataObject);
    return linkedDataObject;
  }
}
