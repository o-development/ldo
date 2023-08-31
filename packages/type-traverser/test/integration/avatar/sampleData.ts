import { Bender, NonBender } from "./AvatarTraverserTypes";
/**
 * Raw Data to Traverse
 */
export const aang: Bender = {
  name: "Aang",
  element: "Air",
  friends: [],
};
export const sokka: NonBender = {
  name: "Sokka",
  friends: [],
};
export const katara: Bender = {
  name: "Katara",
  element: "Water",
  friends: [],
};
aang.friends.push(sokka, katara);
sokka.friends.push(aang, katara);
katara.friends.push(aang, sokka);
