/** @module test-export-20190913235007 */

class _NotExported {
}

/**
 *
 */
class _Foo {
}

/**
 * Named export with 'exports.name =' on a named function.
 * @returns {_Foo | null}
 */
exports.foo = function _foo() {
    return null;
}
