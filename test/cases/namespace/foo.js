/* eslint-disable no-unused-vars,no-var,no-empty-function */
'use strict';

/**
 * @classdesc
 * A Foo.
 *
 * @constructor
 * @template T
 */
FoobarNS.Foo = function Foo() {
};

/**
 * @callback FCallback
 * @this S
 * @memberof FoobarNS.Foo
 * @param {T} first - The first param.
 * @param {number} second - The second param.
 * @param {T[]} third - The third param.
 * @returns {*}
 */

/**
 * A generic method.
 * @param {FoobarNS.Foo.FCallback} f A function.
 * @param {S=} opt_this An object.
 * @template S
 */
FoobarNS.Foo.prototype.f = function f(f, opt_this) {
};

/**
 * @classdesc
 * A Bar.
 *
 * @constructor
 * @extends FoobarNS.Foo
 */
FoobarNS.Bar = function Bar() {
}

/**
 * A method.
 */
FoobarNS.Bar.prototype.f = function f() {
};
