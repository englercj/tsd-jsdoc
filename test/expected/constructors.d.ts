/** @module constructors
 */
declare module "constructors" {
    /**
     * Class documentation.
     */
    class MyClass {
        /**
         * Constructor documentation.
         * @public
         * @param {number} a
         * @param {string} b
         */
        public constructor(a: number, b: string);
    }
    /**
     * Class documentation.
     */
    class MyClass2 {
        /**
         * Constructor documentation.
         * @protected
         * @param {number} a
         * @param {string} b
         */
        protected constructor(a: number, b: string);
    }
    /**
     * Class documentation.
     */
    class MyClass3 {
        /**
         * Constructor documentation.
         * @package
         * @param {number} a
         * @param {string} b
         */
        private constructor(a: number, b: string);
    }
    /**
     * Class documentation.
     */
    class MyClass4 {
        /**
         * Constructor documentation.
         * @private
         * @param {number} a
         * @param {string} b
         */
        private constructor(a: number, b: string);
    }
}
