/** @module test-export-20190913215617 */

class _NotExported {
}

/**
 *
 */
function _foo() {
}

/**
 * Default export with 'module.exports =' on a referenced type.
 */
module.exports = _foo;
