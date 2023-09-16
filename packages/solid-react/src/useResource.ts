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

export function useResource(uri: ContainerUri): Container;
export function useResource(uri: LeafUri): Leaf;
export function useResource(uri: string): Leaf | Container;
export function useResource(uri: string): Leaf | Container {
  const { getResource } = useLdo();
  const resource = useMemo(() => getResource(uri), [getResource, uri]);
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
