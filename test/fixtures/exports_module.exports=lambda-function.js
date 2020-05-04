/** @module test-export-20190913222027 */

class _NotExported {
}

/**
 *
 */
class _Foo {
}

/**
 * Default export with 'module.exports =' on a lambda function.
 * @returns {_Foo | null}
 */
module.exports = function() {
    return null;
}
