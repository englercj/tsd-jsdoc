/** @module test-export-20190913222429
 */
declare module "test-export-20190913222429" {
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
     * Default export with 'module.exports =' on a named class.
     */
    export default class _Qux extends _Baz {
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
