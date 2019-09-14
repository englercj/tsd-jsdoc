/** @module test-export-20190913222429 */

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
 * Default export with 'module.exports =' on a named class.
 */
module.exports = class _Qux extends _Baz {
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
