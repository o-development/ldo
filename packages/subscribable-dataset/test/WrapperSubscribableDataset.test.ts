import type { SubscribableDataset } from "../src";
import { ProxyTransactionalDataset, createSubscribableDataset } from "../src";
import { createDataset } from "@ldo/dataset";
import {
  namedNode,
  literal,
  quad,
  defaultGraph,
  blankNode,
} from "@rdfjs/data-model";
import type { Quad, BlankNode } from "@rdfjs/types";
import testDataset from "@ldo/dataset/test/dataset.testHelper";

describe("WrapperSubscribableDataset", () => {
  // Regular dataset tests
  testDataset({
    dataset: createSubscribableDataset,
  });

  // Subscribable Dataset tests
  let subscribableDatastet: SubscribableDataset<Quad>;
  const tomTypeQuad = quad(
    namedNode("http://example.org/cartoons#Tom"),
    namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    namedNode("http://example.org/cartoons#Cat"),
  );
  const tomNameQuad = quad(
    namedNode("http://example.org/cartoons#Tom"),
    namedNode("http://example.org/cartoons#name"),
    literal("Tom"),
  );
  const tomColorQuad = quad(
    namedNode("http://example.org/cartoons#Tom"),
    namedNode("http://example.org/cartoons#color"),
    namedNode("http://example.org/colors#grey"),
  );
  const lickyNameQuad = quad(
    namedNode("http://example.org/cartoons#Licky"),
    namedNode("http://example.org/cartoons#name"),
    literal("Licky"),
  );
  const lickyTypeQuad = quad(
    namedNode("http://example.org/cartoons#Licky"),
    namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    namedNode("http://example.org/cartoons#Cat"),
  );

  beforeEach(() => {
    subscribableDatastet = createSubscribableDataset([
      tomTypeQuad,
      tomNameQuad,
    ]);
  });

  it("Alerts when a node is added", () => {
    const callbackFunc = jest.fn();
    subscribableDatastet.addListener(
      namedNode("http://example.org/cartoons#Tom"),
      callbackFunc,
    );
    subscribableDatastet.add(tomColorQuad);
    expect(callbackFunc).toBeCalledTimes(1);
    expect(callbackFunc.mock.calls[0][0].size).toBe(3);
    expect(callbackFunc.mock.calls[0][0].has(tomNameQuad)).toBe(true);
    expect(callbackFunc.mock.calls[0][0].has(tomTypeQuad)).toBe(true);
    expect(callbackFunc.mock.calls[0][0].has(tomColorQuad)).toBe(true);
    expect(callbackFunc.mock.calls[0][1].added.size).toBe(1);
    expect(callbackFunc.mock.calls[0][1].added.has(tomColorQuad)).toBe(true);
  });

  it("Alerts when a node is removed", () => {
    const callbackFunc = jest.fn();
    subscribableDatastet.on(
      namedNode("http://example.org/cartoons#Tom"),
      callbackFunc,
    );
    subscribableDatastet.delete(tomTypeQuad);
    expect(callbackFunc).toBeCalledTimes(1);
    expect(callbackFunc.mock.calls[0][0].size).toBe(1);
    expect(callbackFunc.mock.calls[0][0].has(tomNameQuad)).toBe(true);
    expect(callbackFunc.mock.calls[0][1].removed.size).toBe(1);
    expect(callbackFunc.mock.calls[0][1].removed.has(tomTypeQuad)).toBe(true);
  });

  it("Alerts when multiple quads are added", () => {
    const callbackFunc = jest.fn();
    subscribableDatastet.on(
      namedNode("http://example.org/cartoons#Licky"),
      callbackFunc,
    );
    subscribableDatastet.addAll([lickyNameQuad, lickyTypeQuad]);
    expect(callbackFunc).toBeCalledTimes(1);
    expect(callbackFunc.mock.calls[0][0].size).toBe(2);
    expect(callbackFunc.mock.calls[0][0].has(lickyTypeQuad)).toBe(true);
    expect(callbackFunc.mock.calls[0][0].has(lickyNameQuad)).toBe(true);
    expect(callbackFunc.mock.calls[0][1].added.size).toBe(2);
    expect(callbackFunc.mock.calls[0][1].added.has(lickyNameQuad)).toBe(true);
    expect(callbackFunc.mock.calls[0][1].added.has(lickyTypeQuad)).toBe(true);
  });

  it("Alerts when bulk updated by only adding", () => {
    const callbackFuncLicky = jest.fn();
    subscribableDatastet.on(
      namedNode("http://example.org/cartoons#Licky"),
      callbackFuncLicky,
    );
    subscribableDatastet.bulk({
      added: createDataset([lickyTypeQuad]),
    });
    expect(callbackFuncLicky).toBeCalledTimes(1);
    expect(
      callbackFuncLicky.mock.calls[0][0].equals(createDataset([lickyTypeQuad])),
    ).toBe(true);
    expect(
      callbackFuncLicky.mock.calls[0][1].added.equals(
        createDataset([lickyTypeQuad]),
      ),
    ).toBe(true);
    expect(callbackFuncLicky.mock.calls[0][1].removed).toBe(undefined);
  });

  it("Alerts when bulk updated by only removing", () => {
    const callbackFuncTom = jest.fn();
    subscribableDatastet.on(
      namedNode("http://example.org/cartoons#Tom"),
      callbackFuncTom,
    );
    subscribableDatastet.bulk({
      removed: createDataset([tomTypeQuad]),
    });
    expect(callbackFuncTom).toBeCalledTimes(1);
    expect(
      callbackFuncTom.mock.calls[0][0].equals(createDataset([tomNameQuad])),
    ).toBe(true);
    expect(
      callbackFuncTom.mock.calls[0][1].removed.equals(
        createDataset([tomTypeQuad]),
      ),
    ).toBe(true);
    expect(callbackFuncTom.mock.calls[0][1].added).toBe(undefined);
  });

  it("Alerts when bulk updated", () => {
    const callbackFuncLicky = jest.fn();
    const callbackFuncTom = jest.fn();
    subscribableDatastet.on(
      namedNode("http://example.org/cartoons#Tom"),
      callbackFuncTom,
    );
    subscribableDatastet.on(
      namedNode("http://example.org/cartoons#Licky"),
      callbackFuncLicky,
    );
    subscribableDatastet.bulk({
      added: createDataset([lickyTypeQuad]),
      removed: createDataset([tomTypeQuad]),
    });
    expect(callbackFuncLicky).toBeCalledTimes(1);
    expect(callbackFuncTom).toBeCalledTimes(1);
    expect(
      callbackFuncLicky.mock.calls[0][0].equals(createDataset([lickyTypeQuad])),
    ).toBe(true);
    expect(
      callbackFuncTom.mock.calls[0][0].equals(createDataset([tomNameQuad])),
    ).toBe(true);
    expect(
      callbackFuncLicky.mock.calls[0][1].added.equals(
        createDataset([lickyTypeQuad]),
      ),
    ).toBe(true);
    expect(callbackFuncLicky.mock.calls[0][1].removed).toBe(undefined);
    expect(
      callbackFuncTom.mock.calls[0][1].removed.equals(
        createDataset([tomTypeQuad]),
      ),
    ).toBe(true);
    expect(callbackFuncTom.mock.calls[0][1].added).toBe(undefined);
  });

  it("Alerts when the default graph is updated but not when another graph is", () => {
    const callbackFunc = jest.fn();
    subscribableDatastet.on(defaultGraph(), callbackFunc);
    subscribableDatastet.add(lickyNameQuad);
    subscribableDatastet.add(
      quad(
        namedNode("https://example.com/books#Dumbledoor"),
        namedNode("http://example.org/books#name"),
        literal("Dubmledoor"),
        namedNode("https://coolgraphs.com"),
      ),
    );
    expect(callbackFunc).toHaveBeenCalledTimes(1);
    expect(
      callbackFunc.mock.calls[0][0].equals(
        createDataset([tomNameQuad, lickyNameQuad, tomTypeQuad]),
      ),
    ).toBe(true);
  });

  it("Alerts when a named graph is updated", () => {
    const callbackFunc = jest.fn();
    subscribableDatastet.on(namedNode("https://coolgraphs.com"), callbackFunc);
    const quadWithGraph = quad(
      namedNode("https://example.com/books#Dumbledoor"),
      namedNode("http://example.org/books#name"),
      literal("Dubmledoor"),
      namedNode("https://coolgraphs.com"),
    );
    subscribableDatastet.add(quadWithGraph);
    expect(callbackFunc).toHaveBeenCalledTimes(1);
    expect(
      callbackFunc.mock.calls[0][0].equals(createDataset([quadWithGraph])),
    ).toBe(true);
  });

  it("Alerts when one blank node is updated, but not the other", () => {
    const blankNodeQuadA = quad(
      namedNode("http://example.org/cartoons#Tom"),
      namedNode("http://example.org/cartoons#Address"),
      blankNode(),
    );
    const blankNodeQuadB = quad(
      namedNode("http://example.org/cartoons#Licky"),
      namedNode("http://example.org/cartoons#Address"),
      blankNode(),
    );
    subscribableDatastet.addAll([blankNodeQuadA, blankNodeQuadB]);
    const callbackFunc = jest.fn();
    subscribableDatastet.on(blankNodeQuadA.object as BlankNode, callbackFunc);
    const blankNodeAdditionA = quad(
      blankNodeQuadA.object as BlankNode,
      namedNode("http://example.org/cartoons#StreetNumber"),
      literal("1234"),
    );
    subscribableDatastet.add(blankNodeAdditionA);
    const blankNodeAdditionB = quad(
      blankNodeQuadB.object as BlankNode,
      namedNode("http://example.org/cartoons#StreetNumber"),
      literal("65"),
    );
    subscribableDatastet.add(blankNodeAdditionB);
    expect(callbackFunc).toBeCalledTimes(1);
    expect(
      callbackFunc.mock.calls[0][0].equals(
        createDataset([blankNodeQuadA, blankNodeAdditionA]),
      ),
    ).toBe(true);
  });

  it("Throws an error if you try to subscribe to an invalid node type", () => {
    expect(() =>
      // Used incorrect parameter for test
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      subscribableDatastet.on(literal("YOLO"), () => {
        /* Do nothing */
      }),
    ).toThrowError("Invalid term type for subscription");
  });

  it("Provides event names", () => {
    const sampleBlankNode = blankNode();
    subscribableDatastet.on(namedNode("https://example.com"), () => {
      /* Do nothing */
    });
    subscribableDatastet.on(sampleBlankNode, () => {
      /* Do nothing */
    });
    subscribableDatastet.on(defaultGraph(), () => {
      /* Do nothing */
    });
    const subscribableTerms = subscribableDatastet.eventNames();
    expect(subscribableTerms.length).toBe(3);
    expect(
      subscribableTerms.some((curTerm) =>
        curTerm.equals(namedNode("https://example.com")),
      ),
    ).toBe(true);
    expect(
      subscribableTerms.some((curTerm) => curTerm.equals(sampleBlankNode)),
    ).toBe(true);
    expect(
      subscribableTerms.some((curTerm) => curTerm.equals(defaultGraph())),
    ).toBe(true);
  });

  it("Throws an error if somehow a bad key is registered to an event emitter", () => {
    // Disable trypscript to set up a private variable you shouldn't be able to access
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    subscribableDatastet.eventEmitter.on("Blah Blah Blah", () => {
      /* Do Nothing */
    });
    expect(() => subscribableDatastet.eventNames()).toThrowError(
      "Invalid Subscription Key",
    );
  });

  it("Gets the max listeners", () => {
    expect(subscribableDatastet.getMaxListeners()).toBe(10);
  });

  it("Gets the current Listeners for a specific name", () => {
    const dummyListener1 = () => {
      /* Do Nothing */
    };
    const dummyListener2 = () => {
      /* Do Nothing */
    };
    subscribableDatastet.on(
      namedNode("http://example.org/cartoons#Tom"),
      dummyListener1,
    );
    subscribableDatastet.on(
      namedNode("http://example.org/cartoons#Licky"),
      dummyListener2,
    );
    const listeners = subscribableDatastet.listeners(
      namedNode("http://example.org/cartoons#Tom"),
    );
    expect(listeners.length).toBe(1);
    expect(listeners[0]).toBe(dummyListener1);
  });

  it("Unsubscribes from a listener", () => {
    const callbackFunc = jest.fn();
    subscribableDatastet.on(
      namedNode("http://example.org/cartoons#Tom"),
      callbackFunc,
    );
    subscribableDatastet.off(
      namedNode("http://example.org/cartoons#Tom"),
      callbackFunc,
    );
    subscribableDatastet.add(tomColorQuad);
    expect(callbackFunc).toHaveBeenCalledTimes(0);
  });

  it("Runs 'once' without erroring", () => {
    expect(
      subscribableDatastet.once(
        namedNode("http://example.org/cartoons#Tom"),
        () => {
          /* Do Nothing */
        },
      ),
    ).toBe(subscribableDatastet);
  });

  it("Runs 'prependListener' without erroring", () => {
    expect(
      subscribableDatastet.prependListener(
        namedNode("http://example.org/cartoons#Tom"),
        () => {
          /* Do Nothing */
        },
      ),
    ).toBe(subscribableDatastet);
  });

  it("Runs the 'prependOnceListener' without erroring", () => {
    expect(
      subscribableDatastet.prependOnceListener(
        namedNode("http://example.org/cartoons#Tom"),
        () => {
          /* Do Nothing */
        },
      ),
    ).toBe(subscribableDatastet);
  });

  it("Removes all listeners", () => {
    const dummyListener1 = () => {
      /* Do Nothing */
    };
    const dummyListener2 = () => {
      /* Do Nothing */
    };
    subscribableDatastet.on(
      namedNode("http://example.org/cartoons#Tom"),
      dummyListener1,
    );
    subscribableDatastet.on(
      namedNode("http://example.org/cartoons#Licky"),
      dummyListener2,
    );
    subscribableDatastet.removeAllListeners(
      namedNode("http://example.org/cartoons#Tom"),
    );
    expect(
      subscribableDatastet.listenerCount(
        namedNode("http://example.org/cartoons#Tom"),
      ),
    ).toBe(0);
    expect(
      subscribableDatastet.listenerCount(
        namedNode("http://example.org/cartoons#Licky"),
      ),
    ).toBe(1);
  });

  it("Sets max listeners", () => {
    subscribableDatastet.setMaxListeners(20);
    expect(subscribableDatastet.getMaxListeners()).toBe(20);
  });

  it("Returns raw listeners", () => {
    const dummyListener1 = () => {
      /* Do Nothing */
    };
    subscribableDatastet.on(
      namedNode("http://example.org/cartoons#Tom"),
      dummyListener1,
    );
    const rawListeners = subscribableDatastet.rawListeners(
      namedNode("http://example.org/cartoons#Tom"),
    );
    expect(rawListeners.length).toBe(1);
    expect(rawListeners[0]).toBe(dummyListener1);
  });

  it("Returns a transaction", () => {
    expect(
      subscribableDatastet.startTransaction() instanceof
        ProxyTransactionalDataset,
    ).toBe(true);
  });
});
