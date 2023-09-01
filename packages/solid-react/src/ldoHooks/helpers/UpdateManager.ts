import type { DatasetChanges } from "@ldo/subscribable-dataset";
import { createDataset } from "@ldo/dataset";
import { quadMatchToString } from "@ldo/rdf-utils";
import type {
  Quad,
  QuadMatch,
  SubjectNode,
  PredicateNode,
  ObjectNode,
} from "@ldo/rdf-utils";

export class UpdateManager {
  private quadMatchListenerMap: Record<string, Set<() => void>> = {};
  private listenerHashMap: Map<() => void, Set<string>> = new Map();

  registerListener(quadMatch: QuadMatch, callback: () => void): void {
    const hash = quadMatchToString(quadMatch);
    if (!this.quadMatchListenerMap[hash]) {
      this.quadMatchListenerMap[hash] = new Set();
    }
    if (!this.listenerHashMap.has(callback)) {
      this.listenerHashMap.set(callback, new Set());
    }
    this.quadMatchListenerMap[hash].add(callback);
    this.listenerHashMap.get(callback)?.add(hash);
  }

  removeListener(callback: () => void) {
    const hashSet = this.listenerHashMap.get(callback);
    if (hashSet) {
      hashSet.forEach((hash) => {
        this.quadMatchListenerMap[hash]?.delete(callback);
      });
    }
  }

  notifyListenersOfChanges(changes: DatasetChanges<Quad>): void {
    const listenersToNotify = new Set<() => void>();

    const allQuads = createDataset();
    allQuads.addAll(changes.added || []);
    allQuads.addAll(changes.removed || []);

    // Iterate through all quads looking for any dataset match they effect
    allQuads.forEach((tempQuad) => {
      // Cast the input because RDFJS types assume RDF 1.2 where a Subject can
      // be a Quad
      const quad = tempQuad as {
        subject: SubjectNode;
        predicate: PredicateNode;
        object: ObjectNode;
      };
      const quadMatches: QuadMatch[] = [
        [null, null, null, null],
        [quad.subject, null, null, null],
        [quad.subject, quad.predicate, null, null],
        [quad.subject, null, quad.object, null],
        [null, quad.predicate, null, null],
        [null, quad.predicate, quad.object, null],
        [null, null, quad.object, null],
        [quad.subject, quad.predicate, quad.object, null],
      ];

      quadMatches.forEach((quadMatch) => {
        const hash = quadMatchToString(quadMatch);
        this.quadMatchListenerMap[hash]?.forEach((callback) => {
          listenersToNotify.add(callback);
        });
        delete this.quadMatchListenerMap[hash];
      });
    });
    listenersToNotify.forEach((listener) => {
      listener();
    });
  }
}
