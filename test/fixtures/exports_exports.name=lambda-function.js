/** @module test-export-20190914004332 */

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
