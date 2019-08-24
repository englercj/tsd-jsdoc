/**
 * @class
 * @property {String} myProp foobar
 */
declare class PropTest1 {
    /**
     * foobar
    */
    myProp: string;
}

/**
 * @class
 * @property {Number} myProp
 */
declare class PropTest2 {
    /**
     * @name PropTest2#otherProp
     * @type {Number}
     */
    otherProp: number;
    myProp: number;
}

/**
 * @class
 * @property {Boolean} myProp
 */
declare class PropTest3 {
    /**
     * @name PropTest3#myProp
     * @type {Boolean}
     * @description duplicate
     */
    myProp: boolean;
    /**
     * @name PropTest3#myProp
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
declare class PropTest4 {
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
declare class PropTest5 {
    constructor();
    /**
     * @name PropTest5#otherProp
     * @type {Number}
     */
    otherProp: number;
    myProp: number;
}

/**
 * @constructor
 * @property {Boolean} myProp
 */
declare class PropTest6 {
    constructor();
    /**
     * @name PropTest6#myProp
     * @type {Boolean}
     * @description duplicate
     */
    myProp: boolean;
    /**
     * @name PropTest6#myProp
     * @type {Boolean}
     * @description duplicate
     */
    myProp: boolean;
    myProp: boolean;
}
