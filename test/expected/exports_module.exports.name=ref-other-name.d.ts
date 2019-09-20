/** @module test-export-20190913220044
 */
declare module "test-export-20190913220044" {
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
     * Hack: ignored for 'documented' generation strategy with a (re)named export, generated twice otherwise.
     * @ignore
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
     * Hack: ignored for 'documented' generation strategy with a (re)named export, generated twice otherwise.
     * @ignore
     */
    function foo(): _Foo | null;
    /**
     * Hack: ignored for 'documented' generation strategy with a (re)named export, generated twice otherwise.
     * @ignore
     */
    const bar = 0;
}
