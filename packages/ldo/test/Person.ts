import {
  LiteralAs,
  LiteralFrom,
  OptionalAs,
  OptionalFrom,
  SetFrom,
  TermAs,
  TermFrom,
  TermWrapper,
} from "@rdfjs/wrapper";

export class Person extends TermWrapper {
  get name() {
    return OptionalFrom.subjectPredicate(
      this,
      "https://example.org/name",
      LiteralAs.string,
    );
  }

  set name(value) {
    OptionalAs.object(
      this,
      "https://example.org/name",
      value,
      LiteralFrom.string,
    );
  }

  get friend() {
    return SetFrom.subjectPredicate(
      this,
      "https://example.org/friend",
      TermAs.instance(Person),
      TermFrom.instance,
    );
  }
}
