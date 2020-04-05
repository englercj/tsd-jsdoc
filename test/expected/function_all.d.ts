/**
 *
 * @param {number} [a=10]
 * @param {Object} input
 * @param {number} input.x
 * @param {number} input.y
 */
declare function test1(a?: number, input: {
    x: number;
    y: number;
}): void;

/**
 *
 * @param {Array<*>} x
 * @param {Array.<*>} y
 * @param {Array} z
 * @param {Array<Array>} w
 */
declare function test2(x: any[], y: any[], z: any[], w: any[][]): void;

/**
 * @function
 * @param {object[]} myObjs
 * @param {number} myObjs[].foo
 * @param {boolean} myObjs[].bar
 * @param {string} myObjs[].test1
 * @param {string[]} [myObjs[].test2]
 */
declare function test3(myObjs: {
    foo: number;
    bar: boolean;
    test1: string;
    test2?: string[];
}[]): void;

/**
 * @class
 */
declare class Test12345 {
    /**
     * @function
     * @memberof Test12345
     * @name f
     * @return {number[]}
     */
    static f(): number[];
    /**
     * @function
     * @memberof Test12345
     * @variation 1
     * @name f
     * @param {string} key
     * @return {number}
     */
    static f(key: string): number;
}
