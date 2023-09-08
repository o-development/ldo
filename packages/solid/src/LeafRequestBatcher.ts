import type { LeafUri } from "./uriTypes";
import type { PresentLeaf } from "./resource/abstract/leaf/PresentLeaf";
import type { DataLeaf } from "./resource/abstract/leaf/DataLeaf";
import type { ResourceError } from "./resource/error/ResourceError";
import type { BinaryLeaf } from "./resource/abstract/leaf/BinaryLeaf";
import type { DatasetChanges } from "@ldo/rdf-utils";
import type { AbsentLeaf } from "./resource/abstract/leaf/AbsentLeaf";

export interface WaitingProcess<Args extends unknown[], Return> {
  name: string;
  args: Args;
  perform: (...args: Args) => Promise<Return>;
  awaitingResolutions: ((returnValue: Return) => void)[];
  awaitingRejections: ((err: unknown) => void)[];
}

export interface WaitingProcessOptions<Args extends unknown[], Return> {
  name: string;
  args: Args;
  perform: (...args: Args) => Promise<Return>;
  modifyLastProcess: (
    lastProcess: WaitingProcess<unknown[], unknown>,
    args: Args,
  ) => boolean;
}

export abstract class LeafRequestBatcher {
  private lastRequestTimestampMap: Record<string, number> = {};
  private isWaiting: boolean = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private processQueue: WaitingProcess<any[], any>[] = [];
  private shouldBatchAllRequests: boolean;
  private batchMilis: number;

  private triggerOrWaitProcess() {
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
            processToTrigger.args,
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

    if (timeSinceLastTrigger < this.batchMilis && !this.isWaiting) {
      this.isWaiting = true;
      setTimeout(triggerProcess, this.batchMilis - timeSinceLastTrigger);
    } else {
      triggerProcess();
    }
  }

  protected async queueProcess<ReturnType>(
    options: WaitingProcessOptions<unknown[], ReturnType>,
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
      this.processQueue.push({
        name: options.name,
        args: options.args,
        perform: options.perform,
        awaitingResolutions: [resolve],
        awaitingRejections: [reject],
      });
      this.triggerOrWaitProcess();

      // const READ_KEY = "read";
      // const lastProcessInQueue =
      //   this.processQueue[this.processQueue.length - 1];
      // if (lastProcessInQueue?.name === READ_KEY) {
      //   lastProcessInQueue.awaitingResolutions.push(resolve);
      //   lastProcessInQueue.awaitingRejections.push(reject);
      // } else {
      //   const readProcess: WaitingProcess<[], PresentLeaf | ResourceError> = {
      //     name: READ_KEY,
      //     args: [],
      //     perform: this.performRead,
      //     awaitingResolutions: [resolve],
      //     awaitingRejections: [reject],
      //   };
      //   this.processQueue.push(readProcess);
      //   this.triggerOrWaitProcess();
      // }
    });
  }

  // All intance variables
  uri: LeafUri;

  // Read Methods
  read(): Promise<PresentLeaf | ResourceError> {
    const READ_KEY = "read";
    return this.queueProcess({
      name: READ_KEY,
      args: [],
      perform: this.performRead,
      modifyLastProcess: (last) => {
        return last.name === READ_KEY;
      },
    });
  }

  private performRead(): Promise<PresentLeaf | ResourceError> {
    console.log("Reading");
    throw new Error("Doing Read");
  }

  // Create Methods
  abstract createData(overwrite?: boolean): Promise<DataLeaf | ResourceError>;

  abstract upload(
    blob: Blob,
    mimeType: string,
    overwrite?: boolean,
  ): Promise<BinaryLeaf | ResourceError>;

  abstract updateData(
    changes: DatasetChanges,
  ): Promise<DataLeaf | ResourceError>;

  abstract delete(): Promise<AbsentLeaf | ResourceError>;
}
