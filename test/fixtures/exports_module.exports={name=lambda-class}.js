/** @module test-export-20190914004600 */

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
 * Named export with 'module.exports = {name: ...}' on a lambda class.
 */
module.exports = {
	Qux:
		class extends _Baz {
			/**
			 * @param {Bar} bar
			 */
			constructor(bar) {
				/**
				 * @member {_Foo}
				 * @readonly
				 */
				this.foo = bar;
			}
		}
};
