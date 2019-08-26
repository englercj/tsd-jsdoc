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
 * @function Color#[foobar1]
 */
Color.prototype.foobar1 = function() {
    throw new Error('not implemented');
};

/**
 * @name Color#[foobar2]
 * @type {Number}
 */
Color.prototype.foobar2 = undefined;
