/** @module test-export-20190913221432
 */
declare module "test-export-20190913221432" {
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
     * Default export with 'module.exports =' on a lambda class.
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
