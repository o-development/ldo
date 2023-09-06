export abstract class FetchStatus {
  public abstract get didInitialFetch(): boolean;
  public abstract get isAbsent(): boolean | undefined;
  public abstract get isPresent(): boolean | undefined;
}
