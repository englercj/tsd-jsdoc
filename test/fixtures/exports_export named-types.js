/** @module test-export-20190913220851 */

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
 * Named export with 'export' on a named class.
 */
export class Qux extends _Baz {
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

function _notExported() {
}

/**
 * Named export with 'export' on a named function.
 * @returns {_Foo | null}
 */
export function foo() {
    return null;
}
