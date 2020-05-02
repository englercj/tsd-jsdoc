declare module "test-export-20190913220412" {
    class _Foo {
    }
    class _Bar extends _Foo {
    }
    class _Baz {
    }
    /**
     * Default export with 'export default' on a named class.
     */
    export default class extends _Baz {
        constructor(bar: _Bar);
        readonly foo: _Foo;
    }
}
