import type { LeafUri } from "@ldo/solid";
import { useTypeIndexProfile } from "./useTypeIndexProfile";
import { useEffect, useMemo, useState } from "react";
import { useSubscribeToUris } from "./util/useSubscribeToUris";
import { useLdo, useMatchSubject } from "@ldo/solid-react";
import { TypeRegistrationShapeType } from "../.ldo/typeIndex.shapeTypes";
import { RDF_TYPE, TYPE_REGISTRATION } from "../constants";
import {
  getInstanceUris,
  getTypeIndexesUrisFromProfile,
} from "../getTypeIndex";

/**
 * Provides the LeafUris of everything in a type node for a specific class uri
 *
 * @param classUri - the class uri
 * @returns - URIs of all resources registered with this node
 */
export function useInstanceUris(classUri: string): LeafUri[] {
  const { dataset } = useLdo();
  const profile = useTypeIndexProfile();

  const typeIndexUris: string[] = useMemo(
    () => (profile ? getTypeIndexesUrisFromProfile(profile) : []),
    [profile],
  );

  useSubscribeToUris(typeIndexUris);

  const [leafUris, setLeafUris] = useState<LeafUri[]>([]);

  const typeRegistrations = useMatchSubject(
    TypeRegistrationShapeType,
    RDF_TYPE,
    TYPE_REGISTRATION,
  );

  useEffect(() => {
    getInstanceUris(classUri, typeRegistrations.toArray(), {
      solidLdoDataset: dataset,
    }).then(setLeafUris);
  }, [typeRegistrations]);

  return leafUris;
}
