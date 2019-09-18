/** @module test-export-20190913220333
 */
declare module "test-export-20190913220333" {
    /**
     *
     */
    function _foo(): void;
    /**
     * Default export with 'module.exports ='.
     */
    export default _foo;
    /**
     * Hack: ignored for 'documented' generation strategy with a (re)named export.
     * @ignore
     */
    const bar = 0;
}
