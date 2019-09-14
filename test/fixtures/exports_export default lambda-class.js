/** @module test-export-20190913220743 */

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
 * Default export with 'export default' on a lambda class.
 */
export default class extends _Baz {
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
