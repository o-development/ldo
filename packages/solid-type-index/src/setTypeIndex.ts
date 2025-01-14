import { v4 } from "uuid";
import {
  TypeIndexDocumentShapeType,
  TypeRegistrationShapeType,
} from "./.ldo/typeIndex.shapeTypes";
import { FOR_CLASS, RDF_TYPE, TYPE_REGISTRATION } from "./constants";
import { guaranteeOptions, type Options } from "./util/Options";
import { namedNode, quad } from "@rdfjs/data-model";
import type { TypeRegistration } from "./.ldo/typeIndex.typings";
import { getProfile } from "./getTypeIndex";
import { TypeIndexProfileShapeType } from "./.ldo/profile.shapeTypes";
import type { Container } from "@ldo/solid";
import type { ISolidLdoDataset } from "@ldo/solid";
import type { NamedNode } from "@rdfjs/types";

/**
 * =============================================================================
 * INITIALIZERS
 * =============================================================================
 */
export async function initTypeIndex(
  webId: string,
  options?: Options,
): Promise<void> {
  const { dataset } = guaranteeOptions(options);
  const profile = await getProfile(webId, options);
  if (!profile.privateTypeIndex?.length || !profile.publicTypeIndex?.length) {
    const profileFolder = await dataset.getResource(webId).getParentContainer();
    if (profileFolder?.isError) throw profileFolder;
    if (!profileFolder)
      throw new Error("No folder to save the type indexes to.");
    if (!profile.privateTypeIndex?.length) {
      await createIndex(webId, profileFolder, dataset, true);
    }
    if (!profile.publicTypeIndex?.length) {
      await createIndex(webId, profileFolder, dataset, false);
    }
  }
}

/**
 * @internal
 * @param webId
 * @param profileFolder
 * @param dataset
 */
export async function createIndex(
  webId,
  profileFolder: Container,
  dataset: ISolidLdoDataset,
  isPrivate: boolean,
) {
  // Create a private type index
  const createResult = await profileFolder.createChildAndOverwrite(
    `${isPrivate ? "private" : "public"}_index_${v4()}`,
  );
  if (createResult.isError) throw createResult;
  const indexResource = createResult.resource;
  const wacResult = await indexResource.setWac({
    agent: {
      [webId]: { read: true, write: true, append: true, control: true },
    },
    public: {
      read: isPrivate ? false : true,
      write: true,
      append: true,
      control: true,
    },
    authenticated: {
      read: isPrivate ? false : true,
      write: true,
      append: true,
      control: true,
    },
  });
  if (wacResult.isError) throw wacResult;
  const transaction = dataset.startTransaction();
  const cProfile = transaction
    .usingType(TypeIndexProfileShapeType)
    .write(dataset.getResource(webId).uri)
    .fromSubject(webId);
  if (isPrivate) {
    cProfile.privateTypeIndex?.push({ "@id": indexResource.uri });
  } else {
    cProfile.publicTypeIndex?.push({ "@id": indexResource.uri });
  }
  const cTypeIndex = transaction
    .usingType(TypeIndexDocumentShapeType)
    .write(indexResource.uri)
    .fromSubject(indexResource.uri);

  cTypeIndex.type = [{ "@id": "ListedDocument" }, { "@id": "TypeIndex" }];
  const commitResult = await transaction.commitToPod();
  if (commitResult.isError) throw commitResult;
}

/**
 * =============================================================================
 * DATASET MODIFIERS
 * =============================================================================
 */
interface Instances {
  instance?: string[];
  instanceContainer?: string[];
}

export function addRegistration(
  indexUri: string,
  classUri: string,
  instances: Instances,
  options?: Options,
): void {
  // Check to see if its already in the index
  const typeRegistration = findAppropriateTypeRegistration(
    indexUri,
    classUri,
    options,
  );

  // Add instances to type registration
  instances.instance?.forEach((instance) => {
    typeRegistration.instance?.push({ "@id": instance });
  });
  instances.instanceContainer?.forEach((instanceContainer) => {
    typeRegistration.instanceContainer?.push({ "@id": instanceContainer });
  });
}

export async function removeRegistration(
  indexUri: string,
  classUri: string,
  instances: Instances,
  options?: Options,
) {
  // Check to see if its already in the index
  const typeRegistration = findAppropriateTypeRegistration(
    indexUri,
    classUri,
    options,
  );

  console.log(typeRegistration["@id"]);

  // Add instances to type registration
  instances.instance?.forEach((instance) => {
    typeRegistration.instance?.splice(
      typeRegistration.instance.findIndex((val) => val["@id"] === instance),
      1,
    );
  });
  instances.instanceContainer?.forEach((instanceContainer) => {
    console.log("Splicing instanceContainers", instanceContainer);
    typeRegistration.instanceContainer?.splice(
      typeRegistration.instanceContainer.findIndex(
        (val) => val["@id"] === instanceContainer,
      ),
      1,
    );
  });
}

export function findAppropriateTypeRegistration(
  indexUri: string,
  classUri: string,
  options?: Options,
) {
  const { dataset } = guaranteeOptions(options);
  // Check to see if its already in the index
  const existingRegistrationsUris: NamedNode[] = dataset
    .match(
      null,
      namedNode(RDF_TYPE),
      namedNode(TYPE_REGISTRATION),
      namedNode(indexUri),
    )
    .toArray()
    .map((quad) => quad.subject) as NamedNode[];

  const existingRegistrationForClassUri = existingRegistrationsUris.find(
    (registrationUri) => {
      return dataset.has(
        quad(
          registrationUri,
          namedNode(FOR_CLASS),
          namedNode(classUri),
          namedNode(indexUri),
        ),
      );
    },
  )?.value;

  let typeRegistration: TypeRegistration;
  if (existingRegistrationForClassUri) {
    typeRegistration = dataset
      .usingType(TypeRegistrationShapeType)
      .write(indexUri)
      .fromSubject(existingRegistrationForClassUri);
  } else {
    typeRegistration = dataset
      .usingType(TypeRegistrationShapeType)
      .write(indexUri)
      .fromSubject(`${indexUri}#${v4()}`);
    typeRegistration.type = { "@id": "TypeRegistration" };
    typeRegistration.forClass = { "@id": classUri };
  }
  return typeRegistration;
}
