/* eslint-disable no-unused-vars,no-var,no-empty-function */
'use strict';

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {object} Triforce
 * @property {boolean} hasCourage - Indicates whether the Courage component is present.
 * @property {boolean} hasPower - Indicates whether the Power component is present.
 * @property {boolean} hasWisdom - Indicates whether the Wisdom component is present.
 */

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef Anon
 * @property {boolean} hasCourage - Indicates whether the Courage component is present.
 * @property {boolean} hasPower - Indicates whether the Power component is present.
 * @property {boolean} hasWisdom - Indicates whether the Wisdom component is present.
 */

/**
 *
 * @typedef {object} GitGraphOptions
 * @property {string} [elementId = "gitGraph"] - Id of the canvas container
 * @property {Template|string|Object} [template] - Template of the graph
 * @property {string} [author = "Sergio Flores <saxo-guy@epic.com>"] - Default author for commits
 * @property {string} [mode = (null|"compact")]  - Display mode
 * @property {HTMLElement} [canvas] - DOM canvas (ex: document.getElementById("id"))
 * @property {string} [orientation = ("vertical-reverse"|"horizontal"|"horizontal-reverse")] - Graph orientation
 * @property {boolean} [reverseArrow = false] - Make arrows point to ancestors if true
 * @property {number} [initCommitOffsetX = 0] - Add custom offsetX to initial commit.
 * @property {number} [initCommitOffsetY = 0] - Add custom offsetY to initial commit.
 * @property {HTMLElement} [tooltipContainer = document.body] - HTML Element containing tooltips in compact mode.
 */

/**
 * A number, or a string containing a number.
 * @typedef {(number|string)} NumberLike
 */

/**
 * Enum for tri-state values.
 * @readonly
 * @enum {number}
 * @constant
 */
var triState = {
    /** The true value */
    TRUE: 1,
    /** The false value */
    FALSE: -1,
    /** @type {boolean} */
    MAYBE: true,
};

/**
 * @this OtherThing
 */
function doStuff()
{}

/**
 * @class
 * @abstract
 */
class OtherThing
{
    /**
     *
     */
    copy() {}
}

/**
 *
 */
class Stuff
{
    /**
     *
     */
    doStuff()
    {}
}

/**
 *
 */
class Things
{
    /**
     *
     */
    doThings()
    {}
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

/**
 * @class
 * @extends OtherThing
 * @mixes Stuff
 * @mixes Things
 */
class MyThing extends OtherThing
{
    /**
     * @typedef Something
     * @type boolean
     * @memberof MyThing
     */

    /**
     * Constructs!
     * @param {...number} a - The number.
     * @private
     */
    constructor(...a)
    {
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
     * @param {!testns.CircleOptions} opts - Namespace test!
     * @return {MyThing} the new thing.
     */
    static create(opts)
    {
        return new MyThing();
    }

    /**
     * @param {OtherThing} other - To copy from.
     * @override
     */
    copy(other)
    {
        this.derp = other.toString();
    }

    /**
     * Gets a Promise that will resolve with an Object.
     *
     * @return {Promise<Object>} The Promise
     */
     promiseMe() {}

    /**
     *
     * @param {GitGraphOptions} options - GitGraph options
      */
     objParam(o) {}

    /**
     * Gets derp.
     *
     * @member {string}
     */
    get D()
    {
        return this.derp;
    }

    /**
     * Sets derp
     *
     * @param {string} v - The value to set to.
     */
    set D(v)
    {
        this.derp = v;
    }
}

/**
 * @prop {number} Thingy
 */
MyThing.me = 10;
