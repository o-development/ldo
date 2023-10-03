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
   * @param isLoading The current is loading
   * @param args provided args
   * @returns true if the process queue has been modified and a new process should not be added to the queue
   */
  modifyQueue: (
    processQueue: WaitingProcess<any[], any>[],
    isLoading: Record<string, boolean>,
    args: Args,
  ) => boolean;
}

export class RequestBatcher {
  private lastRequestTimestampMap: Record<string, number> = {};
  private loadingMap: Record<string, boolean> = {};
  private isWaiting: boolean = false;
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
    return !!this.loadingMap[key];
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
      if (this.isWaiting) {
        return;
      }
      this.lastRequestTimestampMap[processName] = Date.now();
      this.lastRequestTimestampMap[ANY_KEY] = Date.now();
      const processToTrigger = this.processQueue.shift();
      if (processToTrigger) {
        this.isWaiting = true;
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
        this.isWaiting = false;

        // Reset loading
        if (
          !this.processQueue.some(
            (process) => process.name === processToTrigger.name,
          )
        ) {
          this.loadingMap[processToTrigger.name] = false;
        }

        if (this.processQueue.length > 0) {
          this.triggerOrWaitProcess();
        } else {
          this.loadingMap[ANY_KEY] = false;
        }
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
      const lastProcessInQueue =
        this.processQueue[this.processQueue.length - 1];
      if (lastProcessInQueue) {
        const didModifyLast = lastProcessInQueue
          ? options.modifyQueue(
              this.processQueue,
              this.loadingMap,
              options.args,
            )
          : false;
        if (didModifyLast) {
          lastProcessInQueue.awaitingResolutions.push(resolve);
          lastProcessInQueue.awaitingRejections.push(reject);
          return;
        }
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
      this.loadingMap[waitingProcess.name] = true;
      this.loadingMap[ANY_KEY] = true;
      this.triggerOrWaitProcess();
    });
  }
}
