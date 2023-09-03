import type { BlankNode, NamedNode } from "@rdfjs/types";
import { _getUnderlyingNode } from "../types";
import type { SubjectProxy } from "../subjectProxy/SubjectProxy";

export type RawObject =
  | ({
      "@id"?: string | NamedNode | BlankNode;
    } & {
      [key: string | symbol | number]: RawValue | RawValue[];
    })
  | SubjectProxy;

export type RawValue = string | boolean | number | RawObject | undefined;
