/**
 * @this OtherThing
 */
function doStuff() {
}

/**
 * @class
 * @abstract
 */
class OtherThing {
    /**
     *
     */
    copy() {
    }
}

/**
 *
 */
class Stuff {
    /**
     *
     */
    doStuff() {
    }
}

/**
 *
 */
class Things {
    /**
     *
     */
    doThings() {
    }
}

/**
 * Deep class #1
 *
 * @class
 */
function DeepClass1() {
    /**
     * Deep class #2
     *
     * @class
     */
    function DeepClass2() {
        /**
         * Deep class #3
         *
         * @class
         */
        function DeepClass3() {
            /**
             * Deep class #4
             *
             * @class
             */
            function DeepClass4() {
            }
        }
    }
}

/** @module util */

/**
 * @class MyClass
 * @param {string} message
 * @returns {MyClass}
 */
class MyClass {
    constructor(message) {
        /** @type {string} */
        this.message = message;
    }
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
    constructor(options) {}
}

/**
 * @typedef Something
 * @type boolean
 */

/**
 * @class
 * @extends OtherThing
 * @mixes Stuff
 * @mixes Things
 */
class MyThing extends OtherThing {
    /**
     * Constructs!
     * @param {...number} a - The number.
     * @private
     */
    constructor(...a) {
        super();

        /**
         * Derp or something.
         *
         * @member {string}
         * @readonly
         */
        this.derp = 'me';

        /**
         * @private
         * @member {number}
         */
        this.something = 1;

        /**
         * @member {Object<string, Array<(number|string)>>}
         */
        this.map = {};

        /**
         * @member {Array<Array.<Array<Array.<string[]>>>>}
         */
        this.superArray = {};
    }

    /**
     * Creates a new thing.
     *
     * @param {!FoobarNS.CircleOptions} opts - Namespace test!
     * @return {MyThing} the new thing.
     */
    static create(opts) {
        return new MyThing();
    }

    /**
     * @param {OtherThing} other - To copy from.
     * @override
     */
    copy(other) {
        this.derp = other.toString();
    }

    /**
     * Gets a Promise that will resolve with an Object.
     *
     * @return {Promise<Object>} The Promise
     */
    promiseMe() {
    }

    /**
     *
     * @param {GitGraphOptions} options - GitGraph options
     */
    objParam(o) {
    }

    /**
     * Gets derp.
     *
     * @member {string}
     */
    get D() {
        return this.derp;
    }

    /**
     * Sets derp
     *
     * @param {string} v - The value to set to.
     */
    set D(v) {
        this.derp = v;
    }
}

/**
 * @member {number}
 * @static
 */
MyThing.me = 10;
