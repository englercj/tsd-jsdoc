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
 * @name [foobar1]
 * @memberof Color#
 */
Color.prototype.foobar1 = function() {
    throw new Error('not implemented');
};

/**
 * @function [foobar2]
 * @memberof Color#
 */
Color.prototype.foobar2 = function() {
    throw new Error('not implemented');
};

/**
 * @type {Boolean}
 * @name [foobar3]
 * @memberof Color#
 */
Color.prototype.foobar3 = undefined;

/**
 * @member {String}
 * @name [foobar4]
 * @memberof Color#
 */
Color.prototype.foobar4 = undefined;

/**
 * @member {Object} [foobar5]
 * @memberof Color#
 */
Color.prototype.foobar5 = undefined;
