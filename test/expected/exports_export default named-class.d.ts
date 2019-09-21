/** @module test-export-20190913220412
 */
declare module "test-export-20190913220412" {
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
     * Default export with 'export default' on a named class.
     * @extends _Baz
     */
    export default class extends _Baz {
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
}

