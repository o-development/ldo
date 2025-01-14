import type { ContainerUri, LeafUri, SolidLdoDataset } from "@ldo/solid";
import { createSolidLdoDataset } from "@ldo/solid";
import type { TypeRegistration } from "./.ldo/typeIndex.typings";
import { guaranteeFetch } from "@ldo/solid/dist/util/guaranteeFetch";
import type { TypeIndexProfile } from "./.ldo/profile.typings";
import { TypeIndexProfileShapeType } from "./.ldo/profile.shapeTypes";
import { TypeRegistrationShapeType } from "./.ldo/typeIndex.shapeTypes";
import { RDF_TYPE, TYPE_REGISTRATION } from "./constants";

interface GetInstanceUrisOptions {
  solidLdoDataset?: SolidLdoDataset;
  fetch?: typeof fetch;
}

export async function getTypeRegistrations(
  webId: string,
  options?: GetInstanceUrisOptions,
): Promise<TypeRegistration[]> {
  const fetch = guaranteeFetch(options?.fetch);
  const dataset = options?.solidLdoDataset ?? createSolidLdoDataset({ fetch });

  // Get Profile
  const profileResource = dataset.getResource(webId);
  const readResult = await profileResource.readIfUnfetched();
  if (readResult.isError) throw readResult;
  const profile = dataset
    .usingType(TypeIndexProfileShapeType)
    .fromSubject(webId);

  // Get Type Indexes
  const typeIndexUris = getTypeIndexesUrisFromProfile(profile);

  // Fetch the type Indexes
  await Promise.all(
    typeIndexUris.map(async (typeIndexUri) => {
      const typeIndexResource = dataset.getResource(typeIndexUri);
      const readResult = await typeIndexResource.readIfUnfetched();
      if (readResult.isError) throw readResult;
    }),
  );

  // Get Type Registrations
  return dataset
    .usingType(TypeRegistrationShapeType)
    .matchSubject(RDF_TYPE, TYPE_REGISTRATION);
}

export function getTypeIndexesUrisFromProfile(
  profile: TypeIndexProfile,
): LeafUri[] {
  const uris: LeafUri[] = [];
  profile.privateTypeIndex?.forEach((indexNode) => {
    uris.push(indexNode["@id"] as LeafUri);
  });
  profile.publicTypeIndex?.forEach((indexNode) => {
    uris.push(indexNode["@id"] as LeafUri);
  });
  return uris;
}

export async function getInstanceUris(
  classUri: string,
  typeRegistrations: TypeRegistration[],
  options?: GetInstanceUrisOptions,
): Promise<LeafUri[]> {
  const fetch = guaranteeFetch(options?.fetch);
  const dataset = options?.solidLdoDataset ?? createSolidLdoDataset({ fetch });

  const leafUris = new Set<LeafUri>();
  await Promise.all(
    typeRegistrations.map(async (registration) => {
      if (registration.forClass["@id"] === classUri) {
        // Individual registrations
        registration.instance?.forEach((instance) =>
          leafUris.add(instance["@id"] as LeafUri),
        );
        // Container registrations
        await Promise.all(
          registration.instanceContainer?.map(async (instanceContainer) => {
            const containerResource = dataset.getResource(
              instanceContainer["@id"] as ContainerUri,
            );
            await containerResource.readIfUnfetched();
            containerResource.children().forEach((child) => {
              if (child.type === "leaf") leafUris.add(child.uri);
            });
          }) ?? [],
        );
      }
    }),
  );
  return Array.from(leafUris);
}
