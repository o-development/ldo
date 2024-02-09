export interface AccessModeList {
  read: boolean;
  append: boolean;
  write: boolean;
  control: boolean;
}

export interface WacRule {
  public: AccessModeList;
  authenticated: AccessModeList;
  agent: Record<string, AccessModeList>;
}

// export interface SetWacRule {
//   ruleFor: Resource;
//   public?: AccessModeList;
//   authenticated?: AccessModeList;
//   agent?: Record<string, AccessModeList>;
// }
