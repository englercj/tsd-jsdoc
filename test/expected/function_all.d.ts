/**
 *
 * @param {number} [a=10]
 * @param {Object} input
 * @param {number} input.x
 * @param {number} input.y
 */
declare function test1(
    a?: number,
    input: {
        x: number;
        y: number;
    },
): void;

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
