/** @module test-export-20190914010059 */

class _NotExported {
}

/**
 *
 */
class _Foo {
}

/**
 *
 */
class _Bar extends _Foo {
}

/**
 *
 */
class _Baz {
}

/**
 * Default export with 'module.exports ='.
 */
module.exports = _Foo;

/**
 * Wrong named export with 'exports.name ='.
 */
exports.BadBar = _Bar;

/**
 * Ensure exports points to module.exports.
 */
exports = module.exports;

/**
 * Effective named export with 'exports.name ='.
 */
exports.GoodBaz = _Baz;
