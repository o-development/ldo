import { Mixin } from "ts-mixer";

class Foo {
  protected makeFoo() {
    return "foo";
  }
}

class Bar {
  protected makeBar() {
    return "bar";
  }
}

class FooBar extends Mixin(Foo, Bar) {
  public makeFooBar() {
    return this.makeFoo() + this.makeBar();
  }
}

const fooBar = new FooBar();
