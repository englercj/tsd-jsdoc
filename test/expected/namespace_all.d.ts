declare namespace FoobarNS {
    class Foo<T> {
        f<S>(f: FoobarNS.Foo.FCallback, opt_this?: any, opt_2?: number[] | {
            [key: number]: string[];
        }): void;
    }
    module Foo {
        type FCallback = (this: S, first: T, second: number, third: T[]) => any;
    }
    class Bar extends FoobarNS.Foo {
        f(): void;
    }
    interface CircleOptions {
        radius: number;
    }
    class Circle {
        constructor(opt_options?: FoobarNS.CircleOptions);
    }
}

