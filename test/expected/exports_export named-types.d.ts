declare module "test-export-20190913220851" {
    class _Foo {
    }
    class _Bar extends _Foo {
    }
    class _Baz {
    }
    /**
     * Named export with 'export' on a named class.
     */
    class Qux extends _Baz {
        constructor(bar: _Bar);
        readonly foo: _Foo;
    }
    /**
     * Named export with 'export' on a named function.
     */
    function foo(): _Foo | null;
}
