import { useResource, useSolidAuth, useSubject } from "@ldo/solid-react";
import type { TypeIndexProfile } from "../.ldo/profile.typings";
import { TypeIndexProfileShapeType } from "../.ldo/profile.shapeTypes";

export function useTypeIndexProfile(): TypeIndexProfile | undefined {
  const { session } = useSolidAuth();
  useResource(session.webId, { subscribe: true });
  const profile = useSubject(TypeIndexProfileShapeType, session.webId);
  return profile;
}
