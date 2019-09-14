/** @module test-export-20190913220851
 */
declare module "test-export-20190913220851" {
    /**
     *
     */
    class _Foo {
        constructor();
    }
    /**
     *
     */
    class _Bar extends _Foo {
        constructor();
    }
    /**
     *
     */
    class _Baz {
        constructor();
    }
    /**
     *
     */
    class Qux extends _Baz {
        /**
         * @type {_Foo}
         * @readonly
         */
        readonly foo: _Foo;
        /**
         * @param {_Bar} bar
         */
        constructor(bar: _Bar);
    }
    /**
     * Named export with 'export' on a named function.
     * @returns {_Foo | null}
     */
    function foo(): _Foo | null;
}
