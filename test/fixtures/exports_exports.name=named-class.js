/** @module test-export-20190913233811 */

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
 * Named export with 'exports.name =' on a named class.
 */
exports.Qux = class _Qux extends _Baz {
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
