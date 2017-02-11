/* eslint-disable no-unused-vars,no-var,no-empty-function */
'use strict';

/**
 * @classdesc
 * A Foo.
 *
 * @constructor
 * @template T
 */
testns.Foo = function Foo()
{
};

/**
 * @callback FCallback
 * @this S
 * @memberof testns.Foo
 * @param {T} first - The first param.
 * @param {number} second - The second param.
 * @param {T[]} third - The third param.
 * @returns {*}
 */

/**
 * A generic method.
 * @param {testns.Foo.FCallback} f A function.
 * @param {S=} opt_this An object.
 * @template S
 */
testns.Foo.prototype.f = function f(f, opt_this)
{
};

/**
 * @classdesc
 * A Bar.
 *
 * @constructor
 * @extends testns.Foo
 */
testns.Bar = function Bar() {}

/**
 * A method.
 */
testns.Bar.prototype.f = function f()
{
};
