import { createContext, useContext } from "react";
import { BinaryResourceStoreDependencies } from "./document/resource/binaryResource/BinaryResourceStore";
import { DataResourceStoreDependencies } from "./document/resource/dataResource/DataResourceStore";
import { AccessRulesStoreDependencies } from "./document/accessRules/AccessRulesStore";
import { ContainerResourceStoreDependencies } from "./document/resource/dataResource/containerResource/ContainerResourceStore";

export interface LdoContextData
  extends BinaryResourceStoreDependencies,
    DataResourceStoreDependencies,
    AccessRulesStoreDependencies,
    ContainerResourceStoreDependencies {}

// No default parameter is required as it will be set in the provider
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const LdoContext = createContext<LdoContextData>({});

export const LdoContextProvider = LdoContext.Provider;
export const useLdoContext = () => useContext(LdoContext);
