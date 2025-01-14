import { v4 } from "uuid";
import {
  TypeIndexDocumentShapeType,
  TypeRegistrationShapeType,
} from "./.ldo/typeIndex.shapeTypes";
import { FOR_CLASS, RDF_TYPE, TYPE_REGISTRATION } from "./constants";
import { guaranteeOptions, type Options } from "./util/Options";
import { namedNode } from "@rdfjs/data-model";
import type { TypeRegistration } from "./.ldo/typeIndex.typings";
import { getProfile } from "./getTypeIndex";
import { TypeIndexProfileShapeType } from "./.ldo/profile.shapeTypes";
import type { SolidLdoDataset } from "@ldo/solid";
import type { Container } from "@ldo/solid";

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
      await createIndex(webId, profileFolder, dataset, true);
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
  dataset: SolidLdoDataset,
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

  console.log(indexResource.uri, webId);
  cTypeIndex.type = [{ "@id": "ListedDocument" }, { "@id": "TypeIndex" }];
  console.log("added", transaction.getChanges().added?.toString());
  console.log("removed", transaction.getChanges().added?.toString());
  const commitResult = await transaction.commitToPod();
  if (commitResult.isError) {
    commitResult.errors.forEach((err) => {
      if (err.type === "invalidUriError") {
        console.log(err.uri);
      }
    });
    throw commitResult;
  }
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

  // Add instances to type registration
  instances.instance?.forEach((instance) => {
    typeRegistration.instance?.splice(
      typeRegistration.instance.findIndex((val) => val["@id"] === instance),
      1,
    );
  });
  instances.instanceContainer?.forEach((instanceContainer) => {
    typeRegistration.instance?.splice(
      typeRegistration.instance.findIndex(
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
  const existingRegistrationUri: string | undefined = dataset
    .match(
      null,
      namedNode(RDF_TYPE),
      namedNode(TYPE_REGISTRATION),
      namedNode(indexUri),
    )
    .match(null, namedNode(FOR_CLASS), namedNode(classUri))
    .toArray()[0]?.subject.value;
  let typeRegistration: TypeRegistration;
  if (existingRegistrationUri) {
    typeRegistration = dataset
      .usingType(TypeRegistrationShapeType)
      .write(indexUri)
      .fromSubject(existingRegistrationUri);
  } else {
    typeRegistration = dataset.createData(
      TypeRegistrationShapeType,
      `${indexUri}#${v4()}`,
      dataset.getResource(indexUri),
    );
    typeRegistration.type = { "@id": "TypeRegistration" };
    typeRegistration.forClass = { "@id": classUri };
  }
  return typeRegistration;
}
