import { Resource } from "../Resource";

export abstract class FetchStatus extends Resource {
  public abstract get didInitialFetch(): boolean;
  public abstract get isAbsent(): boolean | undefined;
  public abstract get isPresent(): boolean | undefined;
}
