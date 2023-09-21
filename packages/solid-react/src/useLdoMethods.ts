import type { LdoBase, ShapeType } from "@ldo/ldo";
import { transactionChanges } from "@ldo/ldo";
import { write } from "@ldo/ldo";
import { startTransaction } from "@ldo/ldo";
import type { DatasetChanges, SubjectNode } from "@ldo/rdf-utils";
import type { Resource, SolidLdoDataset } from "@ldo/solid";
import type { Quad } from "@rdfjs/types";

export interface UseLdoMethods {
  dataset: SolidLdoDataset;
  getResource: SolidLdoDataset["getResource"];
  getSubject<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: string | SubjectNode,
  ): Type | Error;
  createData<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: string | SubjectNode,
    ...resources: Resource[]
  ): Type;
  changeData<Type extends LdoBase>(input: Type, ...resources: Resource[]): Type;
  commitData(input: LdoBase): ReturnType<SolidLdoDataset["commitChangesToPod"]>;
}

export function createUseLdoMethods(dataset: SolidLdoDataset): UseLdoMethods {
  return {
    dataset: dataset,
    /**
     * Gets a resource
     */
    getResource: dataset.getResource.bind(dataset),
    /**
     * Returns a Linked Data Object for a subject
     * @param shapeType The shape type for the data
     * @param subject Subject Node
     * @returns A Linked Data Object
     */
    getSubject<Type extends LdoBase>(
      shapeType: ShapeType<Type>,
      subject: string | SubjectNode,
    ): Type | Error {
      return dataset.usingType(shapeType).fromSubject(subject);
    },
    /**
     * Begins tracking changes to eventually commit for a new subject
     * @param shapeType The shape type that defines the created data
     * @param subject The RDF subject for a Linked Data Object
     * @param resources Any number of resources to which this data should be written
     * @returns A Linked Data Object to modify and commit
     */
    createData<Type extends LdoBase>(
      shapeType: ShapeType<Type>,
      subject: string | SubjectNode,
      ...resources: Resource[]
    ): Type {
      const linkedDataObject = dataset
        .usingType(shapeType)
        .write(...resources.map((r) => r.uri))
        .fromSubject(subject);
      startTransaction(linkedDataObject);
      return linkedDataObject;
    },
    /**
     * Begins tracking changes to eventually commit
     * @param input A linked data object to track changes on
     * @param resources
     */
    changeData<Type extends LdoBase>(
      input: Type,
      ...resources: Resource[]
    ): Type {
      // Clone the input and set a graph
      const [transactionLdo] = write(...resources.map((r) => r.uri)).usingCopy(
        input,
      );
      // Start a transaction with the input
      startTransaction(transactionLdo);
      // Return
      return transactionLdo;
    },
    /**
     * Commits the transaction to the global dataset, syncing all subscribing
     * components and Solid Pods
     */
    commitData(
      input: LdoBase,
    ): ReturnType<SolidLdoDataset["commitChangesToPod"]> {
      const changes = transactionChanges(input);
      return dataset.commitChangesToPod(changes as DatasetChanges<Quad>);
    },
  };
}
