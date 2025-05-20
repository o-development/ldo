import type { LdoJsonldContext } from "@ldo/jsonld-dataset-proxy";
import { activityPub } from "./activityPub.js";
import { circular } from "./circular.js";
import { profile } from "./profile.js";
import { reducedProfile } from "./reducedProfile.js";
import { simple } from "./simple.js";
import { extendsSimple } from "./extendsSimple.js";
import { reusedPredicates } from "./reusedPredicates.js";
import { oldExtends } from "./oldExtends.js";
import { orSimple } from "./orSimple.js";
import { andSimple } from "./andSimple.js";
import { eachOfAndSimple } from "./eachOfAndSimple.js";

export interface TestData {
  name: string;
  shexc: string;
  sampleTurtle: string;
  baseNode: string;
  successfulContext: LdoJsonldContext;
  successfulTypings: string;
}

export const testData: TestData[] = [
  simple,
  circular,
  profile,
  reducedProfile,
  activityPub,
  extendsSimple,
  oldExtends,
  reusedPredicates,
  orSimple,
  andSimple,
  eachOfAndSimple,
];
