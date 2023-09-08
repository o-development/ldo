import type { WaitingProcess } from "../src/util/RequestBatcher";
import { RequestBatcher } from "../src/util/RequestBatcher";

describe("RequestBatcher", () => {
  type ReadWaitingProcess = WaitingProcess<[string], string>;

  it("Batches a request", async () => {
    const requestBatcher = new RequestBatcher({ batchMillis: 1000 });
    const perform = async (input: string): Promise<string> => `Hello ${input}`;
    const perform1 = jest.fn(perform);
    const perform2 = jest.fn(perform);
    const perform3 = jest.fn(perform);
    const perform4 = jest.fn(perform);

    const modifyQueue = (queue, isLoading, input: [string]) => {
      const last = queue[queue.length - 1];
      if (last.name === "read") {
        (last as ReadWaitingProcess).args[0] += input;
        return true;
      }
      return false;
    };

    let return1: string = "";
    let return2: string = "";
    let return3: string = "";
    let return4: string = "";

    await Promise.all([
      requestBatcher
        .queueProcess<[string], string>({
          name: "read",
          args: ["a"],
          perform: perform1,
          modifyQueue,
        })
        .then((val) => (return1 = val)),
      requestBatcher
        .queueProcess<[string], string>({
          name: "read",
          args: ["b"],
          perform: perform2,
          modifyQueue,
        })
        .then((val) => (return2 = val)),
      ,
      requestBatcher
        .queueProcess<[string], string>({
          name: "read",
          args: ["c"],
          perform: perform3,
          modifyQueue,
        })
        .then((val) => (return3 = val)),
      ,
      requestBatcher
        .queueProcess<[string], string>({
          name: "read",
          args: ["d"],
          perform: perform4,
          modifyQueue,
        })
        .then((val) => (return4 = val)),
      ,
    ]);

    expect(return1).toBe("Hello a");
    expect(return2).toBe("Hello bcd");
    expect(return3).toBe("Hello bcd");
    expect(return4).toBe("Hello bcd");

    expect(perform1).toHaveBeenCalledTimes(1);
    expect(perform1).toHaveBeenCalledWith("a");
    expect(perform2).toHaveBeenCalledTimes(1);
    expect(perform2).toHaveBeenCalledWith("bcd");
    expect(perform3).toHaveBeenCalledTimes(0);
    expect(perform4).toHaveBeenCalledTimes(0);
  });
});
