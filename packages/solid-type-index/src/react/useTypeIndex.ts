import type { LeafUri } from "@ldo/solid";
import { useTypeIndexProfile } from "./useTypeIndexProfile";
import { useMemo } from "react";
import { useSubscribeToUris } from "./util/useSubscribeToUris";

export function useTypeIndex(classUri: string): Promise<LeafUri[]> {
  const profile = useTypeIndexProfile();

  const typeIndexUris: string[] = useMemo(() => {
    const uris: string[] = [];
    profile?.privateTypeIndex?.forEach((indexNode) => {
      uris.push(indexNode["@id"]);
    });
    profile?.publicTypeIndex?.forEach((indexNode) => {
      uris.push(indexNode["@id"]);
    });
    return uris;
  }, [profile]);

  useSubscribeToUris(typeIndexUris);

  
}
