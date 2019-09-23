/** @module test-export-20190923140603 */

class _NotExported {
}

/**
 * Hack: ignored for 'documented' generation strategy with a (re)named export, generated twice otherwise.
 * @ignore
 */
function _foo() {
}

/**
 * Jsdoc comment for 'documented' generation strategy.
 */
export default {
    /**
     * Named export with 'export default {name: ...}' on a referenced type.
     */
    foo: _foo
};
