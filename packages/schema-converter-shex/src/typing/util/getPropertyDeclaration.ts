import type * as dom from "dts-dom";

export function getPropertyDeclarations(
  expression:
    | string
    | dom.PropertyDeclaration
    | dom.ObjectType
    | dom.InterfaceDeclaration,
): dom.PropertyDeclaration[] {
  if (typeof expression === "string") {
    return [];
  }
  if (expression.kind === "property") {
    return [expression];
  }
  if (expression.kind === "object" || expression.kind === "interface") {
    return expression.members.filter(
      (member): member is dom.PropertyDeclaration => member.kind === "property",
    );
  }
  return [];
}
