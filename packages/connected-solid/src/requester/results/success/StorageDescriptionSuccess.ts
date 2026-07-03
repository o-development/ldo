/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResourceSuccess } from "@ldo/connected";
import type { SolidLeafUri } from "packages/connected-solid/src/types";
import type { SolidResource } from "../../../resources/SolidResource";

export class GetStorageDescriptionUriSuccess extends ResourceSuccess<
  SolidResource<any[]>
> {
  type = "getStorageDescriptionUriSuccess" as const;

  storageDescriptionUri: SolidLeafUri;

  constructor(
    resource: SolidResource<any[]>,
    storageDescriptionUri: SolidLeafUri,
  ) {
    super(resource);
    this.storageDescriptionUri = storageDescriptionUri;
  }
}
