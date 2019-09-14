/** @module test-export-20190914005207
 */
declare module "test-export-20190914005207" {
    /**
     *
     */
    class _Foo {
        constructor();
    }
    /**
     * Named export with 'module.exports = {name: ...}' on a lambda function.
     * @returns {_Foo | null}
     */
    function foo(): _Foo | null;
}
