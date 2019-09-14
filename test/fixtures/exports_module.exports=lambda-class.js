/** @module test-export-20190913221432 */

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
 * Default export with 'module.exports =' on a lambda class.
 */
module.exports = class extends _Baz {
    /**
     * @param {_Bar} bar
     */
    constructor(bar) {
        /**
         * @member {_Foo | null}
         * @readonly
         */
        this.foo = bar;
    }
}
