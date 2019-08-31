/**
 * Interface for classes that represent a color.
 *
 * @interface
 */
declare interface Color {
    /**
     * Get the color as an array of red, green, and blue values, represented as
     * decimal numbers between 0 and 1.
     *
     * @returns {Array<number>} An array containing the red, green, and blue values,
     * in that order.
     */
    rgb(): number[];
    /**
     * @function
     * @name [foobar1]
     * @memberof Color#
     */
    foobar1?(): void;
    /**
     * @function [foobar2]
     * @memberof Color#
     */
    foobar2?(): void;
    /**
     * @type {Boolean}
     * @name [foobar3]
     * @memberof Color#
     */
    foobar3?: boolean;
    /**
     * @member {String}
     * @name [foobar4]
     * @memberof Color#
     */
    foobar4?: string;
    /**
     * @member {Object} [foobar5]
     * @memberof Color#
     */
    foobar5?: any;
}
