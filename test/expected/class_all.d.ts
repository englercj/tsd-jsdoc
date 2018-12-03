/**
 * @this OtherThing
 */
declare function doStuff(): void;

/**
 * @class
 * @abstract
 */
declare class OtherThing {
    copy(): void;

}

declare class Stuff {
    doStuff(): void;

}

declare class Things {
    doThings(): void;

}

/**
 * Deep class #1
 * @class
 */
declare class DeepClass1 {
    constructor();

}

/**
 * @module util
 */
declare namespace util {
    /**
     * @class MyClass
     * @param {string} message
     * @returns {MyClass}
     */
    class MyClass {
        constructor(message: string);

        /**
         * @type {string}
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
            template?: any | string | object;
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
     * @class
     * @extends OtherThing
     * @mixes Stuff
     * @mixes Things
     */
    class MyThing extends OtherThing implements Stuff, Things {
        constructor(...a: number[]);

        /**
         * Derp or something.
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
        superArray: ((((string[])[])[])[])[];

        /**
         * Creates a new thing.
         * @param {!FoobarNS.CircleOptions} opts - Namespace test!
         * @return {MyThing} the new thing.
         */
        static create(opts: any): any;

        /**
         * Gets a Promise that will resolve with an Object.
         * @return {Promise<Object>} The Promise
         */
        promiseMe(): Promise<Object>;

        /**
         * @param {GitGraphOptions} options - GitGraph options
         */
        objParam(options: any): void;

        /**
         * Gets derp.
         * @member {string}
         */
        D: string;

        /**
         * @prop {number} Thingy
         */
        static me: number;

        doStuff(): void;

        doThings(): void;

    }

}

declare module 'DeepClass1' {
    /**
     * Deep class #2
     * @class
     */
    class DeepClass2 {
        constructor();

    }

    module 'DeepClass2' {
        /**
         * Deep class #3
         * @class
         */
        class DeepClass3 {
            constructor();

        }

        module 'DeepClass3' {
            /**
             * Deep class #4
             * @class
             */
            class DeepClass4 {
                constructor();

            }

        }

    }

}

