/** @module test-export-20190923140537 */

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
     * Named export with 'export default {name: ...}' on a lambda function.
     * @returns {_Foo | null}
     */
    foo:
        function() {
            return null;
        }
};
