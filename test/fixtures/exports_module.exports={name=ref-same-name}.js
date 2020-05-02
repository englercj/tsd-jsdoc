/** @module test-export-20190919181839 */

class _NotExported {
}

/**
 *
 */
function foo() {
}

/**
 * Jsdoc comment for 'documented' generation strategy.
 */
module.exports = {
    /**
     * Named export with 'module.exports = {name: ...}' on a referenced type.
     */
    foo: foo
};
