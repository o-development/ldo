/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  SolidContainer,
  SolidLeaf,
  SolidLeafUri,
  SolidResource,
} from "@ldo/connected-solid";
import { NoncompliantPodError } from "@ldo/connected-solid";
import type { WacRule } from "./WacRule.js";
import type { GetWacRuleError } from "./getWacRule.js";
import { getWacRuleWithAclUri } from "./getWacRule.js";
import type { GetWacUriError, GetWacUriResult } from "./getWacUri.js";
import { getWacUri } from "./getWacUri.js";
import { GetWacRuleSuccess } from "./results/GetWacRuleSuccess.js";
import type { SetWacRuleResult } from "./setWacRule.js";
import { setWacRuleForAclUri } from "./setWacRule.js";
import { GetWacUriSuccess } from "./results/GetWacUriSuccess.js";

export interface WacNamespace {
  getWac(options?: {
    ignoreCache?: boolean;
  }): Promise<
    | GetWacUriError<SolidContainer<any[]> | SolidLeaf<any[]>>
    | GetWacRuleError<SolidContainer<any[]> | SolidLeaf<any[]>>
    | GetWacRuleSuccess<SolidContainer<any[]> | SolidLeaf<any[]>>
  >;

  setWac(
    wacRule: WacRule,
  ): Promise<
    | GetWacUriError<SolidLeaf<any[]> | SolidContainer<any[]>>
    | SetWacRuleResult<SolidLeaf<any[]> | SolidContainer<any[]>>
  >;
}

export class WacNamespaceImpl {
  constructor(private resource: SolidResource<any[]>) {
    this.resource = resource;
  }

  /**
   * @internal
   * If a wac uri is fetched, it is cached here
   */
  protected wacUri?: SolidLeafUri;

  /**
   * @internal
   * If a wac rule was fetched, it is cached here
   */
  protected wacRule?: WacRule;

  /**
   * @internal
   * If an acl:default wac rule was fetched, it is cached here
   */
  protected inheritableWacRule?: WacRule;

  /**
   * ===========================================================================
   * WEB ACCESS CONTROL METHODS
   * ===========================================================================
   */
  /**
   * Retrieves the URI for the web access control (WAC) rules for this resource
   * @param options - set the "ignoreCache" field to true to ignore any cached
   * information on WAC rules.
   * @returns WAC Rules results
   */
  protected async getWacUri(options?: {
    ignoreCache?: boolean;
  }): Promise<GetWacUriResult<SolidLeaf<any[]> | SolidContainer<any[]>>> {
    const resourceAsLeafOrContainer = this.resource as unknown as
      | SolidLeaf<any[]>
      | SolidContainer<any[]>;
    // Get the wacUri if not already present
    if (!options?.ignoreCache && this.wacUri) {
      return new GetWacUriSuccess(resourceAsLeafOrContainer, this.wacUri);
    }

    const wacUriResult = await getWacUri(resourceAsLeafOrContainer, {
      fetch: this.resource.context.solid.fetch,
    });
    if (wacUriResult.isError) {
      return wacUriResult;
    }
    this.wacUri = wacUriResult.wacUri;
    return wacUriResult;
  }

  /**
   * Retrieves web access control (WAC) rules for this resource
   * @param options - set the "ignoreCache" field to true to ignore any cached
   * information on WAC rules.
   * @returns WAC Rules results
   *
   * @example
   * ```typescript
   * const resource = ldoSolidDataset
   *   .getResource("https://example.com/container/resource.ttl");
   * const wacRulesResult = await resource.getWac();
   * if (!wacRulesResult.isError) {
   *   const wacRules = wacRulesResult.wacRule;
   *   // True if the resource is publicly readable
   *   console.log(wacRules.public.read);
   *   // True if authenticated agents can write to the resource
   *   console.log(wacRules.authenticated.write);
   *   // True if the given WebId has append access
   *   console.log(
   *     wacRules.agent[https://example.com/person1/profile/card#me].append
   *   );
   *   // True if the given WebId has control access
   *   console.log(
   *     wacRules.agent[https://example.com/person1/profile/card#me].control
   *   );
   * }
   * ```
   */
  async getWac(options?: { ignoreCache?: boolean }) {
    return await this._getWac(options);
  }

  protected async _getWac(options?: {
    ignoreCache?: boolean;
    inheritable?: boolean;
  }): Promise<
    | GetWacUriError<SolidContainer<any[]> | SolidLeaf<any[]>>
    | GetWacRuleError<SolidContainer<any[]> | SolidLeaf<any[]>>
    | GetWacRuleSuccess<SolidContainer<any[]> | SolidLeaf<any[]>>
  > {
    const resourceAsLeafOrContainer = this.resource as unknown as
      | SolidLeaf<any[]>
      | SolidContainer<any[]>;
    // Return the wac rule if it's already cached
    const cachedRule = options?.inheritable
      ? this.inheritableWacRule
      : this.wacRule;
    if (!options?.ignoreCache && cachedRule) {
      return new GetWacRuleSuccess(resourceAsLeafOrContainer, cachedRule);
    }

    // Get the wac uri
    const wacUriResult = await this.getWacUri(options);
    if (wacUriResult.isError) return wacUriResult;

    // Get the wac rule
    const wacResult = await getWacRuleWithAclUri(
      wacUriResult.wacUri,
      resourceAsLeafOrContainer,
      {
        fetch: this.resource.context.solid.fetch,
        inheritable: options?.inheritable,
      },
    );
    if (wacResult.isError) return wacResult;
    // If the wac rules was successfully found
    if (wacResult.type === "getWacRuleSuccess") {
      if (options?.inheritable) {
        this.inheritableWacRule = wacResult.wacRule;
      } else {
        this.wacRule = wacResult.wacRule;
      }
      return wacResult;
    }

    // If the WacRule is absent
    const parentResource = await this.resource.getParentContainer();
    if (parentResource?.isError) return parentResource;
    if (!parentResource) {
      return new NoncompliantPodError(
        resourceAsLeafOrContainer,
        `Resource "${this.resource.uri}" has no Effective ACL resource`,
      );
    }
    return (
      (
        parentResource as SolidContainer<any[]> & {
          wac: WacNamespace;
        }
      ).wac as WacNamespaceImpl
    )._getWac({ ...options, inheritable: true });
  }

  /**
   * Sets access rules for a specific resource
   * @param wacRule - the access rules to set
   * @returns SetWacRuleResult
   *
   * @example
   * ```typescript
   * const resource = ldoSolidDataset
   *   .getResource("https://example.com/container/resource.ttl");
   * const wacRulesResult = await resource.setWac({
   *   public: {
   *     read: true,
   *     write: false,
   *     append: false,
   *     control: false
   *   },
   *   authenticated: {
   *     read: true,
   *     write: false,
   *     append: true,
   *     control: false
   *   },
   *   agent: {
   *     "https://example.com/person1/profile/card#me": {
   *       read: true,
   *       write: true,
   *       append: true,
   *       control: true
   *     }
   *   }
   * });
   * ```
   */
  async setWac(
    wacRule: WacRule,
  ): Promise<
    | GetWacUriError<SolidLeaf<any[]> | SolidContainer<any[]>>
    | SetWacRuleResult<SolidLeaf<any[]> | SolidContainer<any[]>>
  > {
    const resourceAsLeafOrContainer = this.resource as unknown as
      | SolidLeaf<any[]>
      | SolidContainer<any[]>;
    const wacUriResult = await this.getWacUri();
    if (wacUriResult.isError) return wacUriResult;

    const result = await setWacRuleForAclUri(
      wacUriResult.wacUri,
      wacRule,
      resourceAsLeafOrContainer,
      { fetch: this.resource.context.solid.fetch },
    );
    if (result.isError) {
      this.resource.emit("update");
      return result;
    }
    // update cache
    this.wacRule = result.wacRule;
    // clear default rule cache
    // to simplify logic
    this.inheritableWacRule = undefined;
    return result;
  }
}
