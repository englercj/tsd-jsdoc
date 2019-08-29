/**
 * Interface for classes that represent a color.
 *
 * @interface
 */
function Color() {}

/**
 * @function Color.staticMethod1
 */
Color.staticMethod1 = function() {};

/**
 * @function
 * @static
 */
Color.staticMethod2 = function() {};

/**
 * @member {Number} Color.staticMember1
 */
Color.staticMember1 = 1;

/**
 * @member {Boolean}
 * @static
 */
Color.staticMember2 = true;

/**
* @type {String}
* @name Color.staticMember3
*/
Color.staticMember3 = "foobar";

/**
* @type {Object}
* @static
*/
Color.staticMember4 = {};

/**
 * @function
 */
Color.prototype.instanceMethod = function() {};

/**
 * @member {Number}
 */
Color.prototype.instanceMember = 5;

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
