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
import { quad as createQuad } from "@rdfjs/data-model";

export class SolidLdoDataset extends LdoDataset {
  public context: SolidLdoDatasetContext;

  constructor(
    context: SolidLdoDatasetContext,
    datasetFactory: DatasetFactory,
    initialDataset?: Dataset,
  ) {
    super(datasetFactory, initialDataset);
    this.context = context;
  }

  getResource(uri: ContainerUri, options?: ResourceGetterOptions): Container;
  getResource(uri: LeafUri, options?: ResourceGetterOptions): Leaf;
  getResource(uri: string, options?: ResourceGetterOptions): Leaf | Container;
  getResource(uri: string, options?: ResourceGetterOptions): Leaf | Container {
    return this.context.resourceStore.get(uri, options);
  }

  /**
   * commitChangesToPod
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
      // // Rollback errors
      // errors.forEach((error) => {
      //   // Add the graph back to the quads
      //   const added = error[1].added?.map((quad) =>
      //     createQuad(quad.subject, quad.predicate, quad.object, error[0]),
      //   );
      //   const removed = error[1].removed?.map((quad) =>
      //     createQuad(quad.subject, quad.predicate, quad.object, error[0]),
      //   );
      //   this.bulk({
      //     added: removed,
      //     removed: added,
      //   });
      // });

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
   * @param shapeType The shapetype to represent the data
   * @param subject A subject URI
   * @param resources The resources changes to should written to
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
