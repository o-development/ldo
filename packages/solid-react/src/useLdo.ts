import { useCallback, useMemo } from "react";
import { useLdoContext } from "./LdoContext";
import {
  LdoDataset,
  ShapeType,
  startTransaction,
  transactionChanges,
  write,
} from "ldo";
import { splitChangesByGraph } from "./util/splitChangesByGraph";
import { LdoBase } from "ldo/dist/util";
import { Resource } from "./document/resource/Resource";
import { DataResource } from "./document/resource/dataResource/DataResource";
import { BinaryResource } from "./document/resource/binaryResource/BinaryResource";
import { ContainerResource } from "./document/resource/dataResource/containerResource/ContainerResource";
import { AccessRules } from "./document/accessRules/AccessRules";
import { SubjectType } from "jsonld-dataset-proxy";
import { DatasetChanges } from "o-dataset-pack";
import { Quad } from "@rdfjs/types";

export interface UseLdoReturn {
  changeData<Type extends LdoBase>(input: Type, ...resources: Resource[]): Type;
  commitData(input: LdoBase): Promise<void>;
  createData<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: string | SubjectType,
    ...resources: Resource[]
  ): Type;
  dataset: LdoDataset;
  getDataResource: (uri: string) => DataResource;
  getBinaryResource: (uri: string) => BinaryResource;
  getContainerResource: (uri: string) => ContainerResource;
  getAccessRules: (resource: Resource) => AccessRules;
}

export function useLdo(): UseLdoReturn {
  const {
    dataResourceStore,
    containerResourceStore,
    binaryResourceStore,
    accessRulesStore,
    dataset,
  } = useLdoContext();
  /**
   * Begins tracking changes to eventually commit
   */
  const changeData = useCallback(
    <Type extends LdoBase>(input: Type, ...resources: Resource[]) => {
      // Clone the input and set a graph
      const [transactionLdo] = write(...resources.map((r) => r.uri)).usingCopy(
        input
      );
      // Start a transaction with the input
      startTransaction(transactionLdo);
      // Return
      return transactionLdo;
    },
    [dataset]
  );
  /**
   * Begins tracking changes to eventually commit for a new subject
   */
  const createData = useCallback(
    <Type extends LdoBase>(
      shapeType: ShapeType<Type>,
      subject: string | SubjectType,
      ...resources: Resource[]
    ) => {
      const linkedDataObject = dataset
        .usingType(shapeType)
        .write(...resources.map((r) => r.uri))
        .fromSubject(subject);
      startTransaction(linkedDataObject);
      return linkedDataObject;
    },
    []
  );
  /**
   * Commits the transaction to the global dataset, syncing all subscribing
   * components and Solid Pods
   */
  const commitData = useCallback(
    async (input: LdoBase) => {
      const changes = transactionChanges(input);
      const changesByGraph = splitChangesByGraph(
        changes as DatasetChanges<Quad>
      );
      // Make queries
      await Promise.all(
        Array.from(changesByGraph.entries()).map(
          async ([graph, datasetChanges]) => {
            if (graph.termType === "DefaultGraph") {
              return;
            }
            const resource = dataResourceStore.get(graph.value);
            await resource.update(datasetChanges);
          }
        )
      );
    },
    [dataset, fetch]
  );
  // Returns the values
  return useMemo(
    () => ({
      dataset,
      changeData,
      createData,
      commitData,
      getDataResource: (uri) => dataResourceStore.get(uri),
      getBinaryResource: (uri) => binaryResourceStore.get(uri),
      getContainerResource: (uri) => containerResourceStore.get(uri),
      getAccessRules: (resource) => accessRulesStore.get(resource),
    }),
    [dataset, changeData, commitData]
  );
}
