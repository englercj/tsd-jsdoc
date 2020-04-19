/** @module functions */

/**
 *
 * @param {number} [a=10]
 * @param {Object} input
 * @param {number} input.x
 * @param {number} input.y
 */
function test1(input) {
}

/**
 *
 * @param {Array<*>} x
 * @param {Array.<*>} y
 * @param {Array} z
 * @param {Array<Array>} w
 */
function test2(x, y, z, w) {
}

/**
 * @function
 * @param {object[]} myObjs
 * @param {number} myObjs[].foo
 * @param {boolean} myObjs[].bar
 * @param {string} myObjs[].test1
 * @param {string[]} [myObjs[].test2]
 */
function test3(myObjs) {
}

/**
 * @class
 */
class Test12345 {
    /**
     * @function
     * @memberof module:functions~Test12345
     * @name f
     * @return {number[]}
     */

    /**
     * @function
     * @memberof module:functions~Test12345
     * @variation 1
     * @name f
     * @param {string} key
     * @return {number}
     */
}

module.exports = {
    test1: test1,
    test2: test2,
    Test12345: Test12345
}
