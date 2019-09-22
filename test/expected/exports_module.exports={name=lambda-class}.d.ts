/** @module test-export-20190914004600
 */
declare module "test-export-20190914004600" {
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
     * Named export with 'module.exports = {name: ...}' on a lambda class.
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
