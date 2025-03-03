import type { ContainerUri, LeafUri } from "@ldo/solid";
import type { TypeRegistration } from "./.ldo/typeIndex.typings";
import type { TypeIndexProfile } from "./.ldo/profile.typings";
import { TypeIndexProfileShapeType } from "./.ldo/profile.shapeTypes";
import { TypeRegistrationShapeType } from "./.ldo/typeIndex.shapeTypes";
import { RDF_TYPE, TYPE_REGISTRATION } from "./constants";
import type { Options } from "./util/Options";
import { guaranteeOptions } from "./util/Options";
import type { LdSet } from "@ldo/ldo";

export async function getTypeRegistrations(
  webId: string,
  options?: Options,
): Promise<LdSet<TypeRegistration>> {
  const { dataset } = guaranteeOptions(options);

  // Get Profile
  const profile = await getProfile(webId, options);

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

export async function getProfile(
  webId: string,
  options?: Options,
): Promise<TypeIndexProfile> {
  const { dataset } = guaranteeOptions(options);
  const profileResource = dataset.getResource(webId);
  const readResult = await profileResource.readIfUnfetched();
  if (readResult.isError) throw readResult;
  return dataset.usingType(TypeIndexProfileShapeType).fromSubject(webId);
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
  options?: Options,
): Promise<LeafUri[]> {
  const { dataset } = guaranteeOptions(options);

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
