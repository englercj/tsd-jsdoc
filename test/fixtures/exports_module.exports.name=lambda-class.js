/** @module test-export-20190914001452 */

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
 * Named export with 'module.exports.name =' on a lambda class.
 * @extends _Baz
 */
module.exports.Qux = class extends _Baz {
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
