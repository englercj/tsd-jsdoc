/** @module test-export-20190914005207 */

class _NotExported {
}

/**
 *
 */
class _Foo {
}

/**
 * Named export with 'exports.name =' on a lambda function.
 * @returns {_Foo | null}
 */
exports.foo = function() {
    return null;
}
