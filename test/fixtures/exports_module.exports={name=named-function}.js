/** @module test-export-20190914000510 */

class _NotExported {
}

/**
 *
 */
class _Foo {
}

/**
 * Jsdoc comment for 'documented' generation strategy.
 */
module.exports = {
    /**
     * Named export with 'module.exports = {name: ...}' on a named function.
     * @returns {_Foo | null}
     */
    foo:
        function _foo() {
            return null;
        }
};
