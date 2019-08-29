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
     * Get the color as an array of red, green, and blue values, represented as
     * decimal numbers between 0 and 1.
     *
     * @returns {Array<number>} An array containing the red, green, and blue values,
     * in that order.
     */
    rgb(): number[];
}


