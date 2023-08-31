import type { ContextDefinition } from "jsonld";
import { activityPub } from "./activityPub";
import { circular } from "./circular";
import { profile } from "./profile";
import { reducedProfile } from "./reducedProfile";
import { simple } from "./simple";
import { extendsSimple } from "./extendsSimple";
import { reusedPredicates } from "./reusedPredicates";
// import { oldExtends } from "./oldExtends";

export interface TestData {
  name: string;
  shexc: string;
  sampleTurtle: string;
  baseNode: string;
  successfulContext: ContextDefinition;
  successfulTypings: string;
}

export const testData: TestData[] = [
  simple,
  circular,
  profile,
  reducedProfile,
  activityPub,
  extendsSimple,
  // oldExtends,
  reusedPredicates,
];
