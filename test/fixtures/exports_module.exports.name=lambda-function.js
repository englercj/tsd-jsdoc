/** @module test-export-20190914003200 */

class _NotExported {
}

/**
 *
 */
class _Foo {
}

/**
 * Named export with 'module.exports.name =' on a lambda function.
 * @returns {_Foo | null}
 */
module.exports.foo = function() {
    return null;
}
