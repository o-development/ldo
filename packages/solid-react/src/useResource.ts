import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import type {
  Container,
  ContainerUri,
  LeafUri,
  Resource,
  Leaf,
} from "@ldo/solid";
import { useLdo } from "./SolidLdoProvider";

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
  uri?: ContainerUri,
  options?: UseResourceOptions,
): Container | undefined;
export function useResource(
  uri?: LeafUri,
  options?: UseResourceOptions,
): Leaf | undefined;
export function useResource(
  uri?: string,
  options?: UseResourceOptions,
): Leaf | Container | undefined;
export function useResource(
  uri?: string,
  options?: UseResourceOptions,
): Leaf | Container | undefined {
  const { getResource } = useLdo();

  // Get the resource
  const resource = useMemo(() => {
    if (uri) {
      const resource = getResource(uri);
      // Run read operations if necissary
      if (!options?.suppressInitialRead) {
        if (options?.reloadOnMount) {
          resource.read();
        } else {
          resource.readIfUnfetched();
        }
      }
      return resource;
    }
    return undefined;
  }, [getResource, uri]);
  const [resourceRepresentation, setResourceRepresentation] =
    useState(resource);
  const pastResource = useRef<
    { resource?: Resource; callback: () => void } | undefined
  >();

  // Callback function to force the react dom to reload.
  const forceReload = useCallback(
    // Wrap the resource in a proxy so it's techically a different object
    () => {
      if (resource) setResourceRepresentation(new Proxy(resource, {}));
    },
    [resource],
  );
  useEffect(() => {
    // Remove listeners for the previous resource
    if (pastResource.current?.resource) {
      pastResource.current.resource.off(
        "update",
        pastResource.current.callback,
      );
    }
    // Set a new past resource to the current resource
    pastResource.current = { resource, callback: forceReload };
    if (resource) {
      // Add listener
      resource.on("update", forceReload);
      setResourceRepresentation(new Proxy(resource, {}));

      // Unsubscribe on unmount
      return () => {
        resource.off("update", forceReload);
      };
    } else {
      setResourceRepresentation(undefined);
    }
  }, [resource]);
  return resourceRepresentation;
}
