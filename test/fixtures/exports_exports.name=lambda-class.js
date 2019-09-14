/** @module test-export-20190914004059 */

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
 * Named export with 'exports.name =' on a lambda class.
 */
exports.Qux = class extends _Baz {
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
