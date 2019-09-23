/** @module test-export-20190923140554 */

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
export default {
    /**
     * Named export with 'export default {name: ...}' on a named function.
     * @returns {_Foo | null}
     */
    foo:
        function _foo() {
            return null;
        }
};
