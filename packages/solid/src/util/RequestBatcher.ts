/* eslint-disable @typescript-eslint/no-explicit-any */
export interface WaitingProcess<Args extends any[], Return> {
  name: string;
  args: Args;
  perform: (...args: Args) => Promise<Return>;
  awaitingResolutions: ((returnValue: Return) => void)[];
  awaitingRejections: ((err: any) => void)[];
}

export const ANY_KEY = "any";

export interface WaitingProcessOptions<Args extends any[], Return> {
  name: string;
  args: Args;
  perform: (...args: Args) => Promise<Return>;
  /**
   *
   * @param processQueue The current process queue
   * @param currentlyProcessing: The Process that is currently executing
   * @param args provided args
   * @returns A WaitingProcess that this request should listen to, or undefined if it should create its own
   */
  modifyQueue: (
    processQueue: WaitingProcess<any[], any>[],
    currentlyProcessing: WaitingProcess<any[], any> | undefined,
    args: Args,
  ) => WaitingProcess<any[], any> | undefined;
}

/**
 * Request Batcher
 */
export class RequestBatcher {
  private lastRequestTimestampMap: Record<string, number> = {};
  private currentlyProcessing: WaitingProcess<any[], any> | undefined =
    undefined;
  private processQueue: WaitingProcess<any[], any>[] = [];
  public shouldBatchAllRequests: boolean;
  public batchMillis: number;

  constructor(
    options?: Partial<{
      shouldBatchAllRequests: boolean;
      batchMillis: number;
    }>,
  ) {
    this.shouldBatchAllRequests = options?.shouldBatchAllRequests || false;
    this.batchMillis = options?.batchMillis || 1000;
  }

  public isLoading(key: string): boolean {
    return this.currentlyProcessing?.name === key;
  }

  private triggerOrWaitProcess() {
    if (!this.processQueue[0]) {
      return;
    }
    const processName = this.shouldBatchAllRequests
      ? ANY_KEY
      : this.processQueue[0].name;

    // Set last request timestamp if not available
    if (!this.lastRequestTimestampMap[processName]) {
      this.lastRequestTimestampMap[processName] = Date.UTC(0, 0, 0, 0, 0, 0, 0);
    }

    const lastRequestTimestamp = this.lastRequestTimestampMap[processName];
    const timeSinceLastTrigger = Date.now() - lastRequestTimestamp;

    const triggerProcess = async () => {
      if (this.currentlyProcessing) {
        return;
      }
      this.lastRequestTimestampMap[processName] = Date.now();
      this.lastRequestTimestampMap[ANY_KEY] = Date.now();
      const processToTrigger = this.processQueue.shift();
      if (processToTrigger) {
        this.currentlyProcessing = processToTrigger;
        try {
          const returnValue = await processToTrigger.perform(
            ...processToTrigger.args,
          );
          processToTrigger.awaitingResolutions.forEach((callback) => {
            callback(returnValue);
          });
        } catch (err) {
          processToTrigger.awaitingRejections.forEach((callback) => {
            callback(err);
          });
        }
        this.currentlyProcessing = undefined;

        this.triggerOrWaitProcess();
      }
    };

    if (timeSinceLastTrigger < this.batchMillis) {
      setTimeout(triggerProcess, this.batchMillis - timeSinceLastTrigger);
    } else {
      triggerProcess();
    }
  }

  public async queueProcess<Args extends any[], ReturnType>(
    options: WaitingProcessOptions<Args, ReturnType>,
  ): Promise<ReturnType> {
    return new Promise((resolve, reject) => {
      const shouldAwait = options.modifyQueue(
        this.processQueue,
        this.currentlyProcessing,
        options.args,
      );

      if (shouldAwait) {
        shouldAwait.awaitingResolutions.push(resolve);
        shouldAwait.awaitingRejections.push(reject);
        return;
      }

      const waitingProcess: WaitingProcess<Args, ReturnType> = {
        name: options.name,
        args: options.args,
        perform: options.perform,
        awaitingResolutions: [resolve],
        awaitingRejections: [reject],
      };
      // HACK: Ugly cast
      this.processQueue.push(
        waitingProcess as unknown as WaitingProcess<any[], any>,
      );
      this.triggerOrWaitProcess();
    });
  }
}
