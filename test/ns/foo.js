
/**
 * @classdesc
 * A Foo.
 *
 * @constructor
 * @template T
 */
ns.Foo = function() {
};

/**
 * A generic method.
 * @param {function(this: S, T, number, Array.<T>): *} f A function.
 * @param {S=} opt_this An object.
 * @template S
 */
ns.Foo.prototype.f = function(f, opt_this) {
};
