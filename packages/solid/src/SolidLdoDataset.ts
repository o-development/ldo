import { LdoDataset } from "@ldo/ldo";
import type { DatasetChanges, GraphNode } from "@ldo/rdf-utils";
import type { Dataset, DatasetFactory, Quad } from "@rdfjs/types";
import type {
  UpdateResult,
  UpdateResultError,
} from "./requester/requests/updateDataResource";
import { AggregateError } from "./requester/results/error/ErrorResult";
import { InvalidUriError } from "./requester/results/error/InvalidUriError";
import type { AggregateSuccess } from "./requester/results/success/SuccessResult";
import type { UpdateSuccess } from "./requester/results/success/UpdateSuccess";
import type { Container } from "./resource/Container";
import type { Leaf } from "./resource/Leaf";
import type { ResourceResult } from "./resource/resourceResult/ResourceResult";
import type { ResourceGetterOptions } from "./ResourceStore";
import type { SolidLdoDatasetContext } from "./SolidLdoDatasetContext";
import { splitChangesByGraph } from "./util/splitChangesByGraph";
import type { ContainerUri, LeafUri } from "./util/uriTypes";
import { isContainerUri } from "./util/uriTypes";

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

  async commitChangesToPod(
    changes: DatasetChanges<Quad>,
  ): Promise<
    | AggregateSuccess<ResourceResult<UpdateSuccess, Leaf>>
    | AggregateError<UpdateResultError | InvalidUriError>
  > {
    const changesByGraph = splitChangesByGraph(changes);
    const results: [
      GraphNode,
      DatasetChanges<Quad>,
      UpdateResult | InvalidUriError | { type: "defaultGraph"; isError: false },
    ][] = await Promise.all(
      Array.from(changesByGraph.entries()).map(
        async ([graph, datasetChanges]) => {
          if (graph.termType === "DefaultGraph") {
            // Undefined means that this is the default graph
            this.bulk(datasetChanges);
            return [
              graph,
              datasetChanges,
              { type: "defaultGraph", isError: false },
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
            result.type === "updateSuccess",
        ),
    };
  }
}
