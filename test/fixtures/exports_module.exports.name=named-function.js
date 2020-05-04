/** @module test-export-20190913221147 */

class _NotExported {
}

/**
 *
 */
class _Foo {
}

/**
 * Named export with 'module.exports.name =' on a named function.
 * @returns {_Foo | null}
 */
module.exports.foo = function _foo() {
    return null;
}
