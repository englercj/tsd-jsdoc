/** @module test-export-20190914005207 */

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
     * Named export with 'module.exports = {name: ...}' on a lambda function.
     * @returns {_Foo | null}
     */
    foo:
        function() {
            return null;
        }
};
