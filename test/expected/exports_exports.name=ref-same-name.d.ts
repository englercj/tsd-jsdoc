/** @module test-export-20190919181749
 */
declare module "test-export-20190919181749" {
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
     * @return {_Foo | null}
     */
    function foo(): _Foo | null;
    /**
     *
     */
    const bar = 0;
}
