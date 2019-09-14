/** @module test-export-20190913233811
 */
declare module "test-export-20190913233811" {
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
     * Named export with 'exports.name =' on a named class.
     */
    class Qux extends _Baz {
        /**
         * @param {_Bar} bar
         */
        constructor(bar: _Bar);
        /**
         * @member {_Foo}
         * @readonly
         */
        readonly foo: _Foo;
    }
}
