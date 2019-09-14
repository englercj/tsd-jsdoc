/** @module test-export-20190914010059
 */
declare module "test-export-20190914010059" {
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
     * Default export with 'module.exports ='.
     */
    export default _Foo;
    /**
     * Effective named export with 'exports.name ='.
     */
    type GoodBaz = _Baz;
}
