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
 * @class
 * @extends OtherThing
 * @mixes Stuff
 * @mixes Things
 */
class MyThing extends OtherThing
{
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
    }

    /**
     * Creates a new thing.
     *
     * @param {testns.CircleOptions} opts - Namespace test!
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
