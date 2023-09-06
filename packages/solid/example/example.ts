const resourceMethods: Record<string, string[]> = {
  RootContainerResource: [
    "uri",
    "isLoading",
    "didInitialFetch",
    "ldoDataset",
    "getIsRootContainer",
    "createContainerIn",
    "createDataResourceIn",
    "uploadBinaryIn",
    "createOrOverwrite",
    "read",
    "reload",
    "load",
    "clear",
    "clearIfPresent",
  ],
  ContainerResource: [
    "uri",
    "isLoading",
    "didInitialFetch",
    "parentContainer",
    "getIsRootContainer",
    "getParentContainer",
    "childResources",
    "getRootContainer",
    "createContainerIn",
    "createDataResourceIn",
    "uploadBinaryIn",
    "ldoDataset",
    "createOrOverwrite",
    "read",
    "reload",
    "load",
    "delete",
    "deleteIfPresent",
    "clear",
    "clearIfPresent",
  ],
  ChildDataResource: [
    "uri",
    "isLoading",
    "didInitialFetch",
    "parentContainer",
    "getParentContainer",
    "hasData",
    "ldoDataset",
    "getRootContainer",
    "createOrOverwrite",
    "read",
    "reload",
    "load",
    "delete",
    "deleteIfPresent",
  ],
  BinaryResource: [
    "uri",
    "isLoading",
    "didInitialFetch",
    "mimeType",
    "fileExtension",
    "getRootContainer",
    "getParentContainer",
    "uploadOrOverwrite",
    "read",
    "reload",
    "load",
    "delete",
    "deleteIfPresent",
  ],
  AbsentContainerResource: [
    "uri",
    "isLoading",
    "didInitialFetch",
    "parentContainer",
    "getIsRootContainer",
    "getParentContainer",
    "getRootContainer",
    "createContainerIn",
    "createDataResourceIn",
    "uploadBinaryIn",
    "createOrOverwrite",
    "create",
    "createIfAbsent",
    "read",
    "reload",
    "load",
    "deleteIfPresent",
    "clearIfPresent",
  ],
  AbsentChildDataResource: [
    "uri",
    "isLoading",
    "didInitialFetch",
    "parentContainer",
    "getParentContainer",
    "getRootContainer",
    "createOrOverwrite",
    "create",
    "createIfAbsent",
    "read",
    "reload",
    "load",
    "deleteIfPresent",
  ],
  AbsentBinaryResource: [
    "uri",
    "isLoading",
    "didInitialFetch",
    "parentContainer",
    "getParentContainer",
    "getRootContainer",
    "uploadOrOverwrite",
    "upload",
    "uploadIfAbsent",
    "read",
    "reload",
    "load",
    "deleteIfPresent",
  ],
  UnfetchedContainerResource: [
    "uri",
    "isLoading",
    "didInitialFetch",
    "getIsRootContainer",
    "getParentContainer",
    "getRootContainer",
    "createContainerIn",
    "createDataResourceIn",
    "uploadBinaryIn",
    "createOrOverwrite",
    "createIfAbsent",
    "read",
    "reload",
    "load",
    "clearIfPresent",
  ],
  UnfetchedChildDataResource: [
    "parentContainer",
    "getParentContainer",
    "uri",
    "isLoading",
    "didInitialFetch",
    "getRootContainer",
    "createOrOverwrite",
    "createIfAbsent",
    "read",
    "reload",
    "load",
    "deleteIfPresent",
  ],
  UnfetchedBinaryResource: [
    "uri",
    "isLoading",
    "didInitialFetch",
    "parentContainer",
    "getParentContainer",
    "getRootContainer",
    "uploadOrOverwrite",
    "createOrOverwrite",
    "uploadIfAbsent",
    "read",
    "reload",
    "load",
    "deleteIfPresent",
  ],
};

function processTypes() {
  const usedKeys = new Set();
  const interfaces = Object.keys(resourceMethods);
  const groupMap: Record<string, string[]> = {};

  interfaces.forEach((interfaceName) => {
    resourceMethods[interfaceName].forEach((methodKey) => {
      if (!usedKeys.has(methodKey)) {
        usedKeys.add(methodKey);

        let groupName = "";
        interfaces.forEach((interfaceName) => {
          if (resourceMethods[interfaceName].includes(methodKey)) {
            groupName += `${interfaceName}|`;
          }
        });
        if (!groupMap[groupName]) {
          groupMap[groupName] = [];
        }
        groupMap[groupName].push(methodKey);
      }
    });
  });

  console.log(groupMap);
}
processTypes();
