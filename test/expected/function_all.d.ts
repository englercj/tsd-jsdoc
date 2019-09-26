/** @module functions
 */
declare module "functions" {
    /**
     *
     * @param {number} [a=10]
     * @param {Object} input
     * @param {number} input.x
     * @param {number} input.y
     */
    function test1(a?: number, input: {
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
    function test2(x: any[], y: any[], z: any[], w: any[][]): void;
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
        static f(): number[];
        /**
         * @function
         * @memberof module:functions~Test12345
         * @variation 1
         * @name f
         * @param {string} key
         * @return {number}
         */
        static f(key: string): number;
    }
}
