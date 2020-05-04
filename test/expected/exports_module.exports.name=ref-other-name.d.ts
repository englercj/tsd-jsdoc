declare module "test-export-20190913220044" {
    class _Foo {
    }
    class _Bar extends _Foo {
    }
    class _Baz {
    }
    class Qux extends _Baz {
        constructor(bar: _Bar);
        readonly foo: _Foo;
    }
    function foo(): _Foo | null;
    const bar = 0;
}
