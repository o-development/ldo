import type { ObjectTypeMember } from "dts-dom";
import * as dom from "dts-dom";

export function dedupeObjectTypeMembers(
  memberList: ObjectTypeMember[],
): ObjectTypeMember[] {
  const properties: Record<string, dom.PropertyDeclaration> = {};
  memberList.forEach((expression) => {
    const propertyDeclaration = expression as dom.PropertyDeclaration;
    // Combine properties if they're duplicates
    if (properties[propertyDeclaration.name]) {
      const oldPropertyDeclaration = properties[propertyDeclaration.name];
      const oldPropertyTypeAsArray =
        oldPropertyDeclaration.type as dom.ArrayTypeReference;
      const oldProeprtyType =
        oldPropertyTypeAsArray.kind === "array"
          ? oldPropertyTypeAsArray.type
          : oldPropertyDeclaration.type;
      const propertyTypeAsArray =
        propertyDeclaration.type as dom.ArrayTypeReference;
      const propertyType =
        propertyTypeAsArray.kind === "array"
          ? propertyTypeAsArray.type
          : propertyDeclaration.type;
      const isOptional =
        propertyDeclaration.flags === dom.DeclarationFlags.Optional ||
        oldPropertyDeclaration.flags === dom.DeclarationFlags.Optional;
      properties[propertyDeclaration.name] = dom.create.property(
        propertyDeclaration.name,
        dom.type.array(dom.create.union([oldProeprtyType, propertyType])),
        isOptional ? dom.DeclarationFlags.Optional : dom.DeclarationFlags.None,
      );
      // Set JS Comment
      properties[propertyDeclaration.name].jsDocComment =
        oldPropertyDeclaration.jsDocComment && propertyDeclaration.jsDocComment
          ? `${oldPropertyDeclaration.jsDocComment} | ${propertyDeclaration.jsDocComment}`
          : oldPropertyDeclaration.jsDocComment ||
            propertyDeclaration.jsDocComment;
    } else {
      properties[propertyDeclaration.name] = propertyDeclaration;
    }
  });
  return Object.values(properties);
}
