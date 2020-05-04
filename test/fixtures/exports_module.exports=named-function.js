/** @module test-export-20190913223443 */

class _NotExported {
}

/**
 *
 */
class _Foo {
}

/**
 * Default export with 'module.exports =' on a named function.
 * @returns {_Foo | null}
 */
module.exports = function _foo() {
    return null;
}
