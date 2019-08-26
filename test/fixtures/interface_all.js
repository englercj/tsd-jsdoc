/**
 * Interface for classes that represent a color.
 *
 * @interface
 */
function Color() {}

/**
 * Get the color as an array of red, green, and blue values, represented as
 * decimal numbers between 0 and 1.
 *
 * @returns {Array<number>} An array containing the red, green, and blue values,
 * in that order.
 */
Color.prototype.rgb = function() {
    throw new Error('not implemented');
};

/**
 * @function
 * @name Color#[foobar1]
 */
Color.prototype.foobar1 = function() {
    throw new Error('not implemented');
};

/**
 * @function Color#[foobar2]
 */
Color.prototype.foobar2 = function() {
    throw new Error('not implemented');
};

/**
 * @type {Boolean}
 * @name Color#[foobar3]
 */
Color.prototype.foobar3 = undefined;

/**
 * @member {String}
 * @name Color#[foobar4]
 */
Color.prototype.foobar4 = undefined;
