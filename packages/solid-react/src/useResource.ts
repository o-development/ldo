import { useMemo, useEffect, useRef } from "react";
import type {
  Container,
  ContainerUri,
  LeafUri,
  Resource,
  Leaf,
} from "@ldo/solid";
import { useLdo } from "./SolidLdoProvider";
import { useForceReload } from "./util/useForceReload";

export interface UseResourceOptions {
  suppressInitialRead?: boolean;
  reloadOnMount?: boolean;
}

export function useResource(
  uri: ContainerUri,
  options?: UseResourceOptions,
): Container;
export function useResource(uri: LeafUri, options?: UseResourceOptions): Leaf;
export function useResource(
  uri: string,
  options?: UseResourceOptions,
): Leaf | Container;
export function useResource(
  uri: string,
  options?: UseResourceOptions,
): Leaf | Container {
  const { getResource } = useLdo();
  const resource = useMemo(() => {
    const resource = getResource(uri);
    if (!options?.suppressInitialRead) {
      if (options?.reloadOnMount) {
        resource.read();
      } else {
        resource.readIfUnfetched();
      }
    }
    return resource;
  }, [getResource, uri]);
  const pastResource = useRef<Resource | undefined>();
  const forceReload = useForceReload();
  useEffect(() => {
    if (pastResource.current) {
      pastResource.current.off("update", forceReload);
    }
    pastResource.current = resource;
    resource.on("update", forceReload);

    return () => {
      resource.off("update", forceReload);
    };
  }, [resource]);
  return resource;
}
