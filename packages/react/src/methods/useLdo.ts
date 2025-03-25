import {
  changeData,
  type ConnectedLdoDataset,
  type ConnectedLdoTransactionDataset,
  type ConnectedPlugin,
} from "@ldo/connected";
import { getDataset, type LdoBase, type ShapeType } from "@ldo/ldo";
import type { SubjectNode } from "@ldo/rdf-utils";

export interface UseLdoMethods<Plugins extends ConnectedPlugin[]> {
  dataset: ConnectedLdoDataset<Plugins>;
  getResource: ConnectedLdoDataset<Plugins>["getResource"];
  setContext: ConnectedLdoDataset<Plugins>["setContext"];
  getSubject<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: string | SubjectNode,
  ): Type;
  createData<Type extends LdoBase>(
    shapeType: ShapeType<Type>,
    subject: string | SubjectNode,
    resource: Plugins[number]["types"]["resource"],
    ...additionalResources: Plugins[number]["types"]["resource"][]
  ): Type;
  changeData<Type extends LdoBase>(
    input: Type,
    resource: Plugins[number]["types"]["resource"],
    ...additionalResources: Plugins[number]["types"]["resource"][]
  ): Type;
  commitData(
    input: LdoBase,
  ): ReturnType<ConnectedLdoTransactionDataset<Plugins>["commitToRemote"]>;
}

export function createUseLdo<Plugins extends ConnectedPlugin[]>(
  dataset: ConnectedLdoDataset<Plugins>,
) {
  return (): UseLdoMethods<Plugins> => ({
    dataset,
    /**
     * Gets a resource
     */
    getResource: dataset.getResource.bind(dataset),
    /**
     * Set the context
     */
    setContext: dataset.setContext.bind(dataset),
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
      resource: Plugins[number]["types"]["resource"],
      ...additionalResources: Plugins[number]["types"]["resource"][]
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
    commitData(
      input: LdoBase,
    ): ReturnType<ConnectedLdoTransactionDataset<Plugins>["commitToRemote"]> {
      const inputDataset = getDataset(
        input,
      ) as ConnectedLdoTransactionDataset<Plugins>;
      return inputDataset.commitToRemote();
    },
  });
}
