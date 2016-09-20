/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {object} Triforce
 * @property {boolean} hasCourage - Indicates whether the Courage component is present.
 * @property {boolean} hasPower - Indicates whether the Power component is present.
 * @property {boolean} hasWisdom - Indicates whether the Wisdom component is present.
 */
interface Triforce {
   hasCourage: boolean;
   hasPower: boolean;
   hasWisdom: boolean;
}


/**
 * Enum for tri-state values.
 * @readonly
 * @enum {number}
 */
declare enum triState {
   /** The true value */
   TRUE,
   FALSE,
   /** @type {boolean} */
   MAYBE
}

/**
 * @this OtherThing
 */
declare function doStuff(): void;

/**
 * @class
 * @abstract
 */
declare abstract class OtherThing {
}

/**
 *
 */
declare class Stuff {
   /**
    *
    */
   constructor();

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
   constructor();

   /**
    *
    */
   doThings(): void;

}

/**
 * @class
 * @extends OtherThing
 * @mixes Stuff
 * @mixes Things
 */
declare class MyThing extends OtherThing implements Stuff, Things {
   /**
    * @class
    * @extends OtherThing
    * @mixes Stuff
    * @mixes Things
    */
   constructor(a: (number|string));

   /**
    * Derp or something.
    *
    * @member {string}
    * @readonly
    */
   derp: string;

   /**
    * Creates a new thing.
    *
    * @return {MyThing} the new thing.
    */
   static create(): MyThing;

   /**
    * @param {OtherThing} other - To copy from.
    * @override
    */
   copy(other: OtherThing): void;

   /**
    * Gets derp.
    *
    * @member {string}
    */
   D: string;

}

/**
 * @namespace testns
 */
declare module testns {
   /**
    * @typedef {{radius: number}}
    */
   type CircleOptions = Object;

   /**
    * @classdesc
    * Set circle style for vector features.
    *
    * @constructor
    * @param {ns.CircleOptions=} opt_options Options.
    * @extends {ol.style.Image}
    * @api
    */
   class Circle extends ol.style.Image {
       /**
        * @classdesc
        * Set circle style for vector features.
        *
        * @constructor
        * @param {ns.CircleOptions=} opt_options Options.
        * @extends {ol.style.Image}
        * @api
        */
       constructor(opt_options?: ns.CircleOptions);

   }

   /**
    * @classdesc
    * A Foo.
    *
    * @constructor
    * @template T
    */
   class Foo<T> {
       /**
        * @classdesc
        * A Foo.
        *
        * @constructor
        * @template T
        */
       constructor();

       /**
        * A generic method.
        * @param {function(this: S, T, number, Array.<T>): *} f A function.
        * @param {S=} opt_this An object.
        * @template S
        */
       f<S>(f: (() => any), opt_this?: S): void;

   }

}

