declare module "test-export-20190913222429" {
    class _Foo {
    }
    class _Bar extends _Foo {
    }
    class _Baz {
    }
    /**
     * Default export with 'module.exports =' on a named class.
     */
    export default class extends _Baz {
        constructor(bar: _Bar);
        readonly foo: _Foo;
    }
}
