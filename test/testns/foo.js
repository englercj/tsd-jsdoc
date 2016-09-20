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
 * A generic method.
 * @param {function(this: S, T, number, Array.<T>): *} f A function.
 * @param {S=} opt_this An object.
 * @template S
 */
testns.Foo.prototype.f = function f(f, opt_this)
{
};
