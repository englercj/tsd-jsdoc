/** @module test-export-20190919181620 */

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
 */
class Qux extends _Baz {
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
 */
function foo() {
	return null;
}

/**
 *
 */
const bar = 0;

/**
 * Named export with 'module.exports.name =' on a referenced class.
 */
module.exports.Qux = Qux

/**
 * Named export with 'module.exports.name =' on a referenced function.
 */
module.exports.foo = foo;

/**
 * Named export with 'module.exports.name =' on a referenced var/const.
 */
module.exports.bar = bar;
