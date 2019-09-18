/** @module test-export-20190913220202 */

class _NotExported {
}

/**
 * Hack: ignored for 'documented' generation strategy with a (re)named export.
 * @ignore
 */
function _foo() {
}

module.exports = {
    /**
     * Named export with 'module.exports = {name: ...}' on a referenced type.
     */
    foo: _foo
};
