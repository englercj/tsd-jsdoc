/** @module test-export-20190913220412 */

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
 * Default export with 'export default' on a named class.
 */
export default class _Qux extends _Baz {
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
