/** @module test-export-20190914020335 */

class _NotExported {
}

/**
 *
 */
function _foo() {
}

/**
 * Default export with 'module.exports ='.
 */
module.exports = _foo;
/**
 * Wrong 'exports.name =' export.
 * @type {number}
 * @constant
 */
exports.bar = 0;

exports = module.exports
/**
 * Good 'exports.name =' export.
 * @type {string}
 * @constant
 */
exports.baz = "hello";
