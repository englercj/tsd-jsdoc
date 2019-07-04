/**
 * @this OtherThing
 */
declare function doStuff(): void;

/**
 * @class
 * @abstract
 */
declare class OtherThing {
    /**
     *
     */
    copy(): void;
}

/**
 *
 */
declare class Stuff {
    /**
     *
     */
    doStuff(): void;
}

/**
 *
 */
declare class Things {
    /**
     *
     */
    doThings(): void;
}

/**
 * Deep class #1
 *
 * @class
 */
declare class DeepClass1 {
    constructor();
}

declare namespace DeepClass1 {
    /**
     * Deep class #2
     *
     * @class
     */
    class DeepClass2 {
        constructor();
    }
    namespace DeepClass2 {
        /**
         * Deep class #3
         *
         * @class
         */
        class DeepClass3 {
            constructor();
        }
        namespace DeepClass3 {
            /**
             * Deep class #4
             *
             * @class
             */
            class DeepClass4 {
                constructor();
            }
        }
    }
}

/** @module util
 */
declare module 'util' {
    /**
     * @class MyClass
     * @param {string} message
     * @returns {MyClass}
     */
    class MyClass {
        constructor(message: string);
        /** @type {string}
         */
        message: string;
    }
    /**
     * GitGraph
     * @constructor
     * @param {object} options - GitGraph options
     * @param {string} [options.elementId = "gitGraph"] - Id of the canvas container
     * @param {Template|string|object} [options.template] - Template of the graph
     * @param {string} [options.author = "Sergio Flores <saxo-guy@epic.com>"] - Default author for commits
     * @param {string} [options.mode = (null|"compact")]  - Display mode
     * @param {HTMLElement} [options.canvas] - DOM canvas (ex: document.getElementById("id"))
     * @param {string} [options.orientation = ("vertical-reverse"|"horizontal"|"horizontal-reverse")] - Graph orientation
     * @param {boolean} [options.reverseArrow = false] - Make arrows point to ancestors if true
     * @param {number} [options.initCommitOffsetX = 0] - Add custom offsetX to initial commit.
     * @param {number} [options.initCommitOffsetY = 0] - Add custom offsetY to initial commit.
     * @param {HTMLElement} [options.tooltipContainer = document.body] - HTML Element containing tooltips in compact mode.
     * @this GitGraph
     */
    class GitGraph {
        constructor(options: {
            elementId?: string;
            template?: Template | string | any;
            author?: string;
            mode?: string;
            canvas?: HTMLElement;
            orientation?: string;
            reverseArrow?: boolean;
            initCommitOffsetX?: number;
            initCommitOffsetY?: number;
            tooltipContainer?: HTMLElement;
        });
    }
    /**
     * @typedef Something
     * @type boolean
     */
    type Something = boolean;
    interface MyThing extends Stuff, Things {}
    /**
     * @class
     * @extends OtherThing
     * @mixes Stuff
     * @mixes Things
     */
    class MyThing extends OtherThing implements Stuff, Things {
        constructor(...a: number[]);
        /**
         * Derp or something.
         *
         * @member {string}
         * @readonly
         */
        readonly derp: string;
        /**
         * @member {Object<string, Array<(number|string)>>}
         */
        map: {
            [key: string]: (number | string)[];
        };
        /**
         * @member {Array<Array.<Array<Array.<string[]>>>>}
         */
        superArray: string[][][][][];
        /**
         * Creates a new thing.
         *
         * @param {!FoobarNS.CircleOptions} opts - Namespace test!
         * @return {MyThing} the new thing.
         */
        static create(opts: FoobarNS.CircleOptions): MyThing;
        /**
         * Gets a Promise that will resolve with an Object, or reject with OtherThing
         *
         * @return {Promise<Object, OtherThing>} The Promise
         */
        promiseMe(): Promise<object>;
        /**
         * Gets a Promise that will resolve with an array of OtherThings
         *
         * @return {Promise<Array.<OtherThing>>} The Promise
         */
        promiseYou(): Promise<OtherThing[]>;
        /**
         * Gets a Promise that will resolve with a bunch of possible types
         *
         * @return {Promise<Array.<*>|Object|number|string>} The Promise
         */
        promiseFoo(): Promise<any[] | object | number | string>;
        /**
         * Gets a Promise that will resolve with an object with complex properties
         *
         * @return {Promise<{newChannels: Channel[], foo: Bar}>} The Promise
         */
        promiseBar(): Promise<{ newChannels: Channel[]; foo: Bar }>;
        /**
         * Gets a Promise that will resolve with a generic function
         *
         * @return {Promise<Function>} The Promise
         */
        promiseGenericFunc(): Promise<(...params: any[]) => void>;
        /**
         * Gets a Promise that will resolve with a function with no arguments
         * that returns a string.
         *
         * @return {Promise<Function(): string>} The Promise
         */
        promiseStringFunc(): Promise<(...params: any[]) => string>;
        /**
         * Gets a Promise that will resolve with a function with lots of arguments
         * that returns an object.
         *
         * @return {Promise<Function(Array.<OtherThing>, object, number, string): object>} The Promise
         */
        promiseLotsArgsFunc(): Promise<
            (arg0: OtherThing[], arg1: object, arg2: number, arg3: string) => object
        >;
        /**
         * Gets a Promise that will resolve with a function with lots of arguments
         * that returns the default type.
         *
         * @return {Promise<Function(Array.<OtherThing>, object, number, string)>} The Promise
         */
        promiseDefaultRetFunc(): Promise<
            (arg0: OtherThing[], arg1: object, arg2: number, arg3: string) => void
        >;
        /**
         * A param that is a function
         * Note: doesn't matter what I put, a @param only gets "FUNCTION" from jsdoc
         * @param {function(number): object}
         */
        takeFuncParam(f: (...params: any[]) => any): void;
        /**
         * A param that is a complex function
         * Note: doesn't matter what I put, a @param only gets "FUNCTION" from jsdoc
         * @param {function(Array.<OtherThing>, object, number): object}
         */
        takeFuncParamComplex(f: (...params: any[]) => any): void;
        /**
         *
         * @param {GitGraphOptions} options - GitGraph options
         */
        objParam(options: GitGraphOptions): void;
        /**
         * Gets derp.
         *
         * @member {string}
         */
        D: string;
        /**
         * @member {number}
         * @static
         */
        static me: number;
        /**
         *
         */
        copy(): void;
    }
}
