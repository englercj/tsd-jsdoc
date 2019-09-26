/** @module namespaces */

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
FoobarNS.Foo = function Foo() {
};

/**
 * @callback FCallback
 * @this S
 * @memberof module:namespaces~FoobarNS.Foo
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
FoobarNS.Foo.prototype.f = function f(f, opt_this, ...rest) {
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
 * Seems that when FoobarNS is declared in a module, jsdoc does not detect the override of of Foo.f() automatically anymore.
 * Let's tell jsdoc explicitely.
 * @override
 */
FoobarNS.Bar.prototype.f = function f() {
};

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
FoobarNS.Circle = function Circle(opt_options) {
}

/**
 * @member {Number}
 */
FoobarNS.helloWorld1 = 1;

/**
 * @type {Boolean}
 */
FoobarNS.helloWorld2 = true;

/**
 * @constant
 * @type {String}
 */
FoobarNS.helloWorld3 = foobar;

/**
 * @constant
 * @type {Number}
 */
FoobarNS.helloWorld4 = foobar;

/**
 * @constant
 * @type {Boolean}
 */
FoobarNS.helloWorld5 = foobar;

/**
 * @constant
 * @type {Object}
 */
FoobarNS.helloWorld6 = {hello: "world", test: 7.0, foo: "bar"};

/**
 * @constant
 * @type {String}
 */
FoobarNS.helloWorld7 = "test";

/**
 * @constant
 * @type {Number}
 */
FoobarNS.helloWorld8 = 1.2345;

/**
 * @constant
 * @type {Boolean}
 */
FoobarNS.helloWorld9 = true;

module.exports = {
    FoobarNS: FoobarNS
}
