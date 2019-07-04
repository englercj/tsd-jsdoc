/**
 * @namespace FoobarNS
 */

/**
 * @classdesc
 * A Foo.
 *
 * @constructor
 * @template T
 */
FoobarNS.Foo = function Foo() {};

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
 * @param [opt_this=10] An object.
 * @param {number[]|object<number, string[]>} [opt_2=10] An object.
 * @template S
 */
FoobarNS.Foo.prototype.f = function f(f, opt_this, ...rest) {};

/**
 * @classdesc
 * A Bar.
 *
 * @constructor
 * @extends FoobarNS.Foo
 */
FoobarNS.Bar = function Bar() {};

/**
 * A method.
 */
FoobarNS.Bar.prototype.f = function f() {};

/**
 * @interface
 */
FoobarNS.CircleOptions;

/**
 * Circle radius.
 * @type {number}
 */
FoobarNS.CircleOptions.prototype.radius;

/**
 * @classdesc
 * Set circle style for vector features.
 *
 * @constructor
 * @param {FoobarNS.CircleOptions=} opt_options Options.
 */
FoobarNS.Circle = function Circle(opt_options) {};
