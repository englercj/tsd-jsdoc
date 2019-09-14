/** @module test-export-20190913235349 */

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
 * Named export with 'module.exports = {name: ...}' on a named class.
 */
module.exports = {
    Qux:
        class _Qux extends _Baz {
            /**
             * @param {Bar} bar
             */
            constructor(bar) {
                /**
                 * @type {_Foo}
                 * @readonly
                 */
                this.foo = bar;
            }
        }
};
