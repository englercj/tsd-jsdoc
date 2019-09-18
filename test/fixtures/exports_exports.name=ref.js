/** @module test-export-20190914011810 */

class _NotExported {
}

/**
 *
 */
class _Foo {
}

/**
 * @extends _Foo
 */
class _Bar extends _Foo {
}

/**
 *
 */
class _Baz {
}

/**
 * @extends _Baz
 * Hack: ignored for 'documented' generation strategy with a (re)named export.
 * @ignore
 */
class _Qux extends _Baz {
    /**
     * @param {_Bar} bar
     */
    constructor(bar) {
        /**
         * @type {_Foo}
         * @readonly
         */
        this.foo = bar;
    }
}

/**
 * @return {_Foo | null}
 * Hack: ignored for 'documented' generation strategy with a (re)named export.
 * @ignore
 */
function _foo() {
	return null;
}

/**
 * Hack: ignored for 'documented' generation strategy with a (re)named export.
 * @ignore
 */
const _bar = 0;

/**
 * Named export with 'exports.name =' on a referenced class.
 */
exports.Qux = _Qux

/**
 * Named export with 'exports.name =' on a referenced function.
 */
exports.foo = _foo;

/**
 * Named export with 'exports.name =' on a referenced var/const.
 */
exports.bar = _bar;
