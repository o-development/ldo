import type { LdoJsonldContext } from "@ldo/jsonld-dataset-proxy";
import { activityPub } from "./activityPub";
import { circular } from "./circular";
import { profile } from "./profile";
import { reducedProfile } from "./reducedProfile";
import { simple } from "./simple";
import { extendsSimple } from "./extendsSimple";
import { reusedPredicates } from "./reusedPredicates";
import { oldExtends } from "./oldExtends";
import { orSimple } from "./orSimple";
import { andSimple } from "./andSimple";
import { valueSet } from "./valueSet";
import { eachOfAndSimple } from "./eachOfAndSimple";
import { multipleSharedPredicates } from "./multipleSharedPredicates";
import { valueSetScope } from "./valueSet_scope";
import { valueSetOneof } from "./valueSet_oneof.js";
import { valueSetLiteral } from "./valueSet_literal.js";
import { oneOfSimple } from "./oneOfSimple.js";

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
  oneOfSimple,
  multipleSharedPredicates,
  valueSet,
  valueSetScope,
  valueSetOneof,
  valueSetLiteral,
];
