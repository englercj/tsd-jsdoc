
/**
 * @class
 * @property {String} myProp
 */
class PropTest1 {
}

/**
 * @class
 * @property {Number} myProp
 */
class PropTest2 {
    /**
     * @name PropTest2#otherProp
     * @type {Number}
     */
    otherProp = 1;
}

/**
 * @class
 * @property {Boolean} myProp
 */
class PropTest3 {
    /**
     * @name PropTest3#myProp
     * @type {Boolean}
     * @description duplicate
     */
    myProp = true;
}

/**
 * @constructor
 * @property {String} myProp
 */
var PropTest4 = function() {
}

/**
 * @constructor
 * @property {Number} myProp
 */
var PropTest5 = function() {
    /**
     * @name PropTest5#otherProp
     * @type {Number}
     */
    this.otherProp = 1;
}

/**
 * @constructor
 * @property {Boolean} myProp
 */
var PropTest6 = function() {
    /**
     * @name PropTest6#myProp
     * @type {Boolean}
     * @description duplicate
     */
    this.myProp = true;
}
