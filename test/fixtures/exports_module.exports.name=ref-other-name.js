/** @module test-export-20190913220044 */

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
 * Hack: ignored for 'documented' generation strategy with a (re)named export, generated twice otherwise.
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
 * Hack: ignored for 'documented' generation strategy with a (re)named export, generated twice otherwise.
 * @ignore
 */
function _foo() {
	return null;
}

/**
 * Hack: ignored for 'documented' generation strategy with a (re)named export, generated twice otherwise.
 * @ignore
 */
const _bar = 0;

/**
 * Named export with 'module.exports.name =' on a referenced class.
 */
module.exports.Qux = _Qux

/**
 * Named export with 'module.exports.name =' on a referenced function.
 */
module.exports.foo = _foo;

/**
 * Named export with 'module.exports.name =' on a referenced var/const.
 */
module.exports.bar = _bar;
