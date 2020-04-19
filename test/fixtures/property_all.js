/** @module properties */

/**
 * @class
 * @property {String} myProp foobar
 */
class PropTest1 {
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
    otherProp = 1;
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
    myProp = true;
    /**
     * @name module:properties~PropTest3#myProp
     * @type {Boolean}
     * @description duplicate
     */
    myProp = true;
}

/**
 * @constructor
 * @property {String} myProp foobar
 */
var PropTest4 = function() {
}

/**
 * @constructor
 * @property {Number} myProp
 */
var PropTest5 = function() {
    /**
     * @name module:properties~PropTest5#otherProp
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
     * @name module:properties~PropTest6#myProp
     * @type {Boolean}
     * @description duplicate
     */
    this.myProp = true;
    /**
     * @name module:properties~PropTest6#myProp
     * @type {Boolean}
     * @description duplicate
     */
    this.myProp = true;
}

/**
 * @constructor
 * @property {object[]} myProps
 * @property {number} myProps[].foo
 * @property {boolean} myProps[].bar
 * @property {string} myProps[].test1
 * @property {string[]} [myProps[].test2]
 */
var PropTest7 = function() {
}

module.exports = {
    PropTest1: PropTest1,
    PropTest2: PropTest2,
    PropTest3: PropTest3,
    PropTest4: PropTest4,
    PropTest5: PropTest5,
    PropTest6: PropTest6,
    PropTest7: PropTest7
}
