/** @module test-export-20190913222429
 */
declare module "test-export-20190913222429" {
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
     * Default export with 'module.exports =' on a named class.
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
