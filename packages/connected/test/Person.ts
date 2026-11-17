import {
  TermWrapper,
  LiteralAs,
  LiteralFrom,
  TermAs,
  TermFrom,
  SetFrom,
  OptionalFrom,
  OptionalAs,
  RequiredFrom,
  RequiredAs,
} from "@rdfjs/wrapper";

export class Person extends TermWrapper {
  get name(): string | undefined {
    return OptionalFrom.subjectPredicate(
      this,
      "http://xmlns.com/foaf/0.1/name",
      LiteralAs.string,
    );
  }
  set name(value: string | undefined) {
    OptionalAs.object(
      this,
      "http://xmlns.com/foaf/0.1/name",
      value,
      LiteralFrom.string,
    );
  }

  get knows(): Set<Person> {
    return SetFrom.subjectPredicate(
      this,
      "http://xmlns.com/foaf/0.1/knows",
      TermAs.instance(Person),
      TermFrom.instance,
    );
  }
}
