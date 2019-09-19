/** @module test-export-20190913220851
 */
declare module "test-export-20190913220851" {
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
     * Named export with 'export' on a named class.
     * @extends _Baz
     */
    class Qux extends _Baz {
        /**
         * @param {_Bar} bar
         */
        constructor(bar: _Bar);
        /**
         * @type {_Foo}
         * @readonly
         */
        readonly foo: _Foo;
    }
    /**
     * Named export with 'export' on a named function.
     * @returns {_Foo | null}
     */
    function foo(): _Foo | null;
}

