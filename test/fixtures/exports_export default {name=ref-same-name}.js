/** @module test-export-20190923140611 */

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
export default {
    /**
     * Named export with 'export default {name: ...}' on a referenced type.
     */
    foo: foo,
    baz: ""
};
