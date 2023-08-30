import { DatasetChanges, createDataset } from "o-dataset-pack";
import {
  QuadMatch,
  SubjectType,
  PredicateType,
  ObjectType,
  nodeToString,
} from "jsonld-dataset-proxy";
import { Quad } from "@rdfjs/types";

export type TripleMatch = [QuadMatch[0], QuadMatch[1], QuadMatch[2]];

export class UpdateManager {
  private tripleMatchListenerMap: Record<string, Set<() => void>> = {};
  private listenerHashMap: Map<() => void, Set<string>> = new Map();

  private tripleMatchToHash(tripleMatch: TripleMatch): string {
    return `${nodeToString(tripleMatch[0])}${nodeToString(
      tripleMatch[1]
    )}${nodeToString(tripleMatch[2])}`;
  }

  registerListener(tripleMatch: TripleMatch, callback: () => void): void {
    const hash = this.tripleMatchToHash(tripleMatch);
    if (!this.tripleMatchListenerMap[hash]) {
      this.tripleMatchListenerMap[hash] = new Set();
    }
    if (!this.listenerHashMap.has(callback)) {
      this.listenerHashMap.set(callback, new Set());
    }
    this.tripleMatchListenerMap[hash].add(callback);
    this.listenerHashMap.get(callback)?.add(hash);
  }

  removeListener(callback: () => void) {
    const hashSet = this.listenerHashMap.get(callback);
    if (hashSet) {
      hashSet.forEach((hash) => {
        this.tripleMatchListenerMap[hash]?.delete(callback);
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
        subject: SubjectType;
        predicate: PredicateType;
        object: ObjectType;
      };
      const tripleMatches: TripleMatch[] = [
        [null, null, null],
        [quad.subject, null, null],
        [quad.subject, quad.predicate, null],
        [quad.subject, null, quad.object],
        [null, quad.predicate, null],
        [null, quad.predicate, quad.object],
        [null, null, quad.object],
        [quad.subject, quad.predicate, quad.object],
      ];

      tripleMatches.forEach((tripleMatch) => {
        const hash = this.tripleMatchToHash(tripleMatch);
        this.tripleMatchListenerMap[hash]?.forEach((callback) => {
          listenersToNotify.add(callback);
        });
        delete this.tripleMatchListenerMap[hash];
      });
    });
    listenersToNotify.forEach((listener) => {
      listener();
    });
  }
}
