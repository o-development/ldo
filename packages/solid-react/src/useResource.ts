import { useMemo } from "react";
import type {
  Container,
  ContainerUri,
  LeafUri,
  Resource,
  Leaf,
} from "@ldo/solid";
import { useLdo } from "./SolidLdoProvider";

export function useResource(uri: ContainerUri): Container;
export function useResource(uri: LeafUri): Leaf;
export function useResource(uri: string): Resource;
export function useResource(uri: string): Resource {
  const { getResource } = useLdo();
  return useMemo(() => getResource(uri), [getResource, uri]);
}
