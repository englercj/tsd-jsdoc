/** @module test-export-20190913220333 */

class _NotExported {
}

/**
 *
 */
function _foo() {
}

/**
 * Hack: ignored for 'documented' generation strategy with a (re)named export, generated twice otherwise.
 * @ignore
 */
const _bar = 0;

/**
 * Default export with 'module.exports ='.
 */
module.exports = _foo;

/**
 * Named export with 'module.export.name ='.
 */
module.exports.bar = _bar;
