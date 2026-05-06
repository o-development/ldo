import { ResourceSuccess } from "@ldo/connected";
import type { SolidLeafUri } from "packages/connected-solid/src/types";
import type { SolidResource } from "../../../resources/SolidResource";

export class GetStorageDescriptionUriSuccess extends ResourceSuccess<SolidResource> {
  type = "getStorageDescriptionUriSuccess" as const;

  storageDescriptionUri: SolidLeafUri;

  constructor(resource: SolidResource, storageDescriptionUri: SolidLeafUri) {
    super(resource);
    this.storageDescriptionUri = storageDescriptionUri;
  }
}
