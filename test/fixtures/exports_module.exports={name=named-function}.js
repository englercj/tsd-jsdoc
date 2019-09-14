/** @module test-export-20190914005207 */

class _NotExported {
}

/**
 *
 */
class _Foo {
}

/**
 * Named export with 'module.exports = {name: ...}' on a lambda function.
 */
module.exports = {
    foo:
        /**
         * @returns {_Foo | null}
         */
        function() {
            return null;
        }
};
