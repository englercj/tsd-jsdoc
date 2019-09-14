declare namespace Color {
    /**
     * @function Color.staticMethod1
     */
    function staticMethod1(): void;
    /**
     * @function
     * @static
     */
    function staticMethod2(): void;
    /**
     * @member {Number} Color.staticMember1
     */
    var staticMember1: number;
    /**
     * @member {Boolean}
     * @static
     */
    var staticMember2: boolean;
    /**
    * @type {String}
    * @name Color.staticMember3
     */
    var staticMember3: string;
    /**
    * @type {Object}
    * @static
     */
    var staticMember4: any;
}

/**
 * Interface for classes that represent a color.
 *
 * @interface
 */
declare interface Color {
    /**
     * @function
     */
    instanceMethod(): void;
    /**
     * @member {Number}
     */
    instanceMember: number;
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
