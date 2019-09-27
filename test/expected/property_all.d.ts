/** @module properties
 */
declare module "properties" {
    /**
     * @class
     * @property {String} myProp foobar
     */
    class PropTest1 {
        /**
         * foobar
        */
        myProp: string;
    }
    /**
     * @class
     * @property {Number} myProp
     */
    class PropTest2 {
        /**
         * @name module:properties~PropTest2#otherProp
         * @type {Number}
         */
        otherProp: number;
        myProp: number;
    }
    /**
     * @class
     * @property {Boolean} myProp
     */
    class PropTest3 {
        /**
         * @name module:properties~PropTest3#myProp
         * @type {Boolean}
         * @description duplicate
         */
        myProp: boolean;
        /**
         * @name module:properties~PropTest3#myProp
         * @type {Boolean}
         * @description duplicate
         */
        myProp: boolean;
        myProp: boolean;
    }
    /**
     * @constructor
     * @property {String} myProp foobar
     */
    class PropTest4 {
        constructor();
        /**
         * foobar
        */
        myProp: string;
    }
    /**
     * @constructor
     * @property {Number} myProp
     */
    class PropTest5 {
        constructor();
        /**
         * @name module:properties~PropTest5#otherProp
         * @type {Number}
         */
        otherProp: number;
        myProp: number;
    }
    /**
     * @constructor
     * @property {Boolean} myProp
     */
    class PropTest6 {
        constructor();
        /**
         * @name module:properties~PropTest6#myProp
         * @type {Boolean}
         * @description duplicate
         */
        myProp: boolean;
        /**
         * @name module:properties~PropTest6#myProp
         * @type {Boolean}
         * @description duplicate
         */
        myProp: boolean;
        myProp: boolean;
    }
}
