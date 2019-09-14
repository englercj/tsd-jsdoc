/** @module test-export-20190914011810
 */
declare module "test-export-20190914011810" {
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
    class _Qux extends _Baz {
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
     * Named export with 'exports.name =' on a const reference.
     */
    var fooConst: number;
    /**
     * Named export with 'exports.name =' on a function reference.
     */
    function foo(): void;
    /**
     * Named export with 'exports.name =' on a class reference.
     */
    type Qux = _Qux;
}
