/** @module test-export-20190913220202 */

class _NotExported {
}

/**
 *
 */
function _foo() {
}

/**
 * Named export with 'module.exports = {name: ...}' on a referenced type.
 */
module.exports = {
    foo: _foo
};
