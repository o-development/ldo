interface loadingStatus;

export class LoadingManager {
  private loadingStatus: Record<string, Array<[key: string, promise: Promise<unknown>]>>

  public registerProcess(): void {
    
  }
}