/** @module test-export-20190913220743
 */
declare module "test-export-20190913220743" {
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
     * Default export with 'export default' on a lambda class.
     */
    export default class extends _Baz {
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
