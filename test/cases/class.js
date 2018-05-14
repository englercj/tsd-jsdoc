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

/**
 * @class
 * @extends OtherThing
 * @mixes Stuff
 * @mixes Things
 */
class MyThing extends OtherThing {
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
 * @prop {number} Thingy
 */
MyThing.me = 10;
