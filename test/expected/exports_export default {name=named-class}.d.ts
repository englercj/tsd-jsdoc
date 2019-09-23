/** @module test-export-20190923140546
 */
declare module "test-export-20190923140546" {
    /**
     *
     */
    class _Foo {
    }
    /**
     * @extends _Foo
     */
    class _Bar extends _Foo {
    }
    /**
     *
     */
    class _Baz {
    }
    /**
     * Named export with 'export default {name: ...}' on a named class.
     * @param {_Bar} bar
     * @extends _Baz
     */
    class Qux extends _Baz {
        constructor(bar: _Bar);
        /**
         * @type {_Foo}
         * @readonly
         */
        readonly foo: _Foo;
    }
}

