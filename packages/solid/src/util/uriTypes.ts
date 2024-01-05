/**
 * A LeafUri is any URI that has a pahtname that ends in a "/". It represents a
 * container.
 */
// The & {} allows for alias preservation
// eslint-disable-next-line @typescript-eslint/ban-types
export type ContainerUri = `${string}/${NonPathnameEnding}` & {};

/**
 * A LeafUri is any URI that does not have a pahtname that ends in a "/". It
 * represents a data resource or a binary resource. Not a container.
 */
export type LeafUri =
  // The & {} allows for alias preservation
  // eslint-disable-next-line @typescript-eslint/ban-types
  `${string}${EveryLegalPathnameCharacterOtherThanSlash}${NonPathnameEnding}` & {};

/**
 * Checks if a provided string is a Container URI
 * @param uri - the string to check
 * @returns true if the string is a container URI
 */
export function isContainerUri(uri: string): uri is ContainerUri {
  const url = new URL(uri);
  return url.pathname.endsWith("/");
}

/**
 * Checks if a provided string is a leaf URI
 * @param uri - the string to check
 * @returns true if the string is a leaf URI
 */
export function isLeafUri(uri: string): uri is LeafUri {
  return !isContainerUri(uri);
}

/**
 * @internal
 */
type NonPathnameEnding = "" | `?${string}` | `#${string}`;

/**
 * @internal
 */
type EveryLegalPathnameCharacterOtherThanSlash =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "0"
  | "-"
  | "."
  | "_"
  | "~"
  | ":"
  | "["
  | "]"
  | "@"
  | "!"
  | "$"
  | "&"
  | "'"
  | "("
  | ")"
  | "*"
  | "+"
  | ","
  | ";"
  | "=";
