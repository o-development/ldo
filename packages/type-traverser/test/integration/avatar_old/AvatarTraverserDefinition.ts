import type { TraverserDefinition } from "../../../src";
import type { AvatarTraverserTypes, Bender } from "./AvatarTraverserTypes";

export const avatarTraverserDefinition: TraverserDefinition<AvatarTraverserTypes> =
  {
    Element: {
      kind: "primitive",
    },
    Bender: {
      kind: "interface",
      properties: {
        element: "Element",
        friends: "Person",
      },
    },
    NonBender: {
      kind: "interface",
      properties: {
        friends: "Person",
      },
    },
    Person: {
      kind: "union",
      selector: (item) => {
        return (item as Bender).element ? "Bender" : "NonBender";
      },
    },
  };
