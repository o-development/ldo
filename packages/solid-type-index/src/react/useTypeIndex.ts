import type { LeafUri } from "@ldo/solid";
import { useTypeIndexProfile } from "./useTypeIndexProfile";
import { useEffect, useMemo } from "react";
import { useLdo } from "@ldo/solid-react";

export function useTypeIndex(classUri: string): Promise<LeafUri[]> {
  const { dataset } = useLdo();

  const profile = useTypeIndexProfile();
  const typeIndexUris: string[] = useMemo(() => {
    const uris: string[] = [];
    profile?.privateTypeIndex?.forEach((indexNode) => {
      uris.push(indexNode["@id"]);
    });
    profile?.publicTypeIndex?.forEach((indexNode) => {
      uris.push(indexNode["@id"]);
    });
  }, [profile]);

  useEffect(() => {
    const resources = typeIndexUris.map((uri) => dataset.getResource(uri));
    resources.forEach((resource) => {
      resource.readIfUnfetched();
      resource.subscribeToNotifications();
    });

    return () => {
      resources.forEach((resource) => resource.unsubscribeFromNotifications());
    }
  }, [typeIndexUris]);
}
