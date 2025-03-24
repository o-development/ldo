import type { LdoBase, ShapeType } from "@ldo/ldo";
import type { SubjectNode } from "@ldo/rdf-utils";
import type {
  Resource,
  SolidLdoDataset,
  SolidLdoTransactionDataset,
} from "@ldo/solid";
import { changeData, commitData } from "@ldo/solid";

export interface UseLdoMethods {
  dataset: SolidLdoDataset;
  getResource: SolidLdoDataset["getResource"];
  getSubject<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: string | SubjectNode,
  ): Type;
  createData<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: string | SubjectNode,
    resource: Resource,
    ...additionalResources: Resource[]
  ): Type;
  changeData<Type extends LdoBase>(
    input: Type,
    resource: Resource,
    ...additionalResources: Resource[]
  ): Type;
  commitData(
    input: LdoBase,
  ): ReturnType<SolidLdoTransactionDataset["commitToPod"]>;
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
    ): Type {
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
      resource: Resource,
      ...additionalResources: Resource[]
    ): Type {
      return dataset.createData(
        shapeType,
        subject,
        resource,
        ...additionalResources,
      );
    },
    /**
     * Begins tracking changes to eventually commit
     * @param input A linked data object to track changes on
     * @param resources
     */
    changeData: changeData,
    /**
     * Commits the transaction to the global dataset, syncing all subscribing
     * components and Solid Pods
     */
    commitData: commitData,
  };
}
