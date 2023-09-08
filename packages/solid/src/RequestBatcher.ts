/* eslint-disable @typescript-eslint/no-explicit-any */
export interface WaitingProcess<Args extends any[], Return> {
  name: string;
  args: Args;
  perform: (...args: Args) => Promise<Return>;
  awaitingResolutions: ((returnValue: Return) => void)[];
  awaitingRejections: ((err: any) => void)[];
}

export interface WaitingProcessOptions<Args extends any[], Return> {
  name: string;
  args: Args;
  perform: (...args: Args) => Promise<Return>;
  modifyLastProcess: (
    lastProcess: WaitingProcess<any[], any>,
    args: Args,
  ) => boolean;
}

export class RequestBatcher {
  private lastRequestTimestampMap: Record<string, number> = {};
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

  private triggerOrWaitProcess() {
    if (!this.processQueue[0]) {
      return;
    }
    const processName = this.shouldBatchAllRequests
      ? "any"
      : this.processQueue[0].name;

    // Set last request timestamp if not available
    if (!this.lastRequestTimestampMap[processName]) {
      this.lastRequestTimestampMap[processName] = Date.UTC(0, 0, 0, 0, 0, 0, 0);
    }

    const lastRequestTimestamp = this.lastRequestTimestampMap[processName];
    const timeSinceLastTrigger = Date.now() - lastRequestTimestamp;

    const triggerProcess = async () => {
      this.isWaiting = false;
      this.lastRequestTimestampMap[processName] = Date.now();
      this.lastRequestTimestampMap["any"] = Date.now();
      const processToTrigger = this.processQueue.shift();
      if (processToTrigger) {
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
        this.triggerOrWaitProcess();
      }
    };

    if (timeSinceLastTrigger < this.batchMillis && !this.isWaiting) {
      this.isWaiting = true;
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
          ? options.modifyLastProcess(lastProcessInQueue, options.args)
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
      this.triggerOrWaitProcess();
    });
  }
}
