/** @module test-export-20190914011810 */

class _NotExported {
}

/**
 * @type {number}
 */
const _fooConst = 0;

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
 *
 */
class _Qux extends _Baz {
    /**
     * @param {_Bar} bar
     */
    constructor(bar) {
        /**
         * @member {_Foo}
         * @readonly
         */
       this.foo = bar;
    }
}

/**
 * @returns {_Foo | null}
 */
function _foo() {
	return null;
}


/**
 * Named export with 'exports.name =' on a const reference.
 */
exports.fooConst = _fooConst;

/**
 * Named export with 'exports.name =' on a function reference.
 */
exports.foo = _foo;

/**
 * Named export with 'exports.name =' on a class reference.
 */
exports.Qux = _Qux;
