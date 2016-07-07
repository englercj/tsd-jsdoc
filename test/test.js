'use strict';

class OtherThing {}

/**
 * @class
 * @extends OtherThing
 */
class MyThing extends OtherThing
{
    /**
     * Constructs!
     * @param {number} a - The number.
     */
    constructor(a)
    {
        /**
         * Derp or something.
         *
         * @member {string}
         */
        this.derp = 'me';
    }

    /**
     * @param {OtherThing} other - To copy from.
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
    get D() { return this.derp; }

    /**
     * Sets derp
     *
     * @param {string} v - The value to set to.
     */
    set D(v) { this.derp = v; }
}
