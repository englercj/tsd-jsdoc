/** @module test-export-20190914020335
 */
declare module "test-export-20190914020335" {
    /**
     *
     */
    function _foo(): void;
    /**
     * Default export with 'module.exports ='.
     */
    export default _foo;
    /**
     * Good 'exports.name =' export.
     * @type {string}
     * @constant
     */
    var baz: string;
}
