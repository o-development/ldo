import {
  useLdo,
  useResource,
  useSolidAuth,
  useSubject,
} from "@ldo/solid-react";
import type { ChangeEvent } from "react";
import React, { useCallback, type FunctionComponent } from "react";
import { SolidProfileShapeShapeType } from "../.ldo/solidProfile.shapeTypes";

export const Profile: FunctionComponent = () => {
  const { session } = useSolidAuth();
  const profile = useSubject(SolidProfileShapeShapeType, session.webId);
  const webIdResource = useResource(session.webId);
  const { changeData, commitData } = useLdo();

  const onNameChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (profile && webIdResource) {
        const cProfile = changeData(profile, webIdResource);
        cProfile.fn = e.target.value;
        await commitData(cProfile);
      }
    },
    [profile, webIdResource],
  );

  return (
    <>
      <label>Name</label>
      <input type="text" value={profile?.fn || ""} onChange={onNameChange} />
    </>
  );
};
