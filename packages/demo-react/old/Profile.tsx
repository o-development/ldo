import type { FunctionComponent } from "react";
import React from "react";
import { SolidProfileShapeShapeType } from "./ldo/solidProfile.shapeTypes";
import BlurTextInput from "./BlurTextInput";
import {
  useSolidAuth,
  useLdo,
  useDataResource,
  useSubject,
} from "@ldo/solid-react";

const Profile: FunctionComponent = () => {
  const { changeData, commitData } = useLdo();
  const { session } = useSolidAuth();
  const webId = session.webId!;
  const webIdResource = useDataResource(webId);
  const [profile, profileError] = useSubject(SolidProfileShapeShapeType, webId);

  if (webIdResource.isLoading) {
    return <p>Loading</p>;
  } else if (profileError) {
    return <p>profileError.message</p>;
  } else {
    return (
      <div>
        <label>Name:</label>
        <BlurTextInput
          value={profile.name || ""}
          onBlurText={async (text) => {
            const cProfile = changeData(profile, webIdResource);
            cProfile.name = text;
            await commitData(cProfile);
          }}
        />
      </div>
    );
  }
};

export default Profile;
