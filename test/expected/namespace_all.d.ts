/**
 * @namespace FoobarNS
 */
declare namespace FoobarNS {
    /**
     * @classdesc
     * A Foo.
     *
     * @constructor
     * @template T
     */
    class Foo<T> {
        /**
         * A generic method.
         * @param {FoobarNS.Foo.FCallback} f A function.
         * @param [opt_this=10] An object.
         * @param {number[]|object<number, string[]>} [opt_2=10] An object.
         * @template S
         */
        f<S>(f: FoobarNS.Foo.FCallback, opt_this?: any, opt_2?: number[] | {
            [key: number]: string[];
        }): void;
    }
    namespace Foo {
        /**
         * @callback FCallback
         * @this S
         * @memberof FoobarNS.Foo
         * @param {T} first - The first param.
         * @param {number} second - The second param.
         * @param {T[]} third - The third param.
         * @returns {*}
         */
        type FCallback = (this: S, first: T, second: number, third: T[]) => any;
    }
    /**
     * @classdesc
     * A Bar.
     *
     * @constructor
     * @extends FoobarNS.Foo
     */
    class Bar extends FoobarNS.Foo {
    }
    /**
     * @interface
     */
    interface CircleOptions {
        /**
         * Circle radius.
         * @type {number}
         */
        radius: number;
    }
    /**
     * @classdesc
     * Set circle style for vector features.
     *
     * @constructor
     * @param {FoobarNS.CircleOptions=} opt_options Options.
     */
    class Circle {
        constructor(opt_options?: FoobarNS.CircleOptions);
    }
    /**
     * @member {Number}
     */
    var helloWorld1: number;
    /**
     * @type {Boolean}
     */
    var helloWorld2: boolean;
    /**
     * @constant
     * @type {String}
     */
    const helloWorld3: string;
    /**
     * @constant
     * @type {Number}
     */
    const helloWorld4: number;
    /**
     * @constant
     * @type {Boolean}
     */
    const helloWorld5: boolean;
    /**
     * @constant
     * @type {Object}
     */
    const helloWorld6: any;
    /**
     * @constant
     * @type {String}
     */
    const helloWorld7 = "test";
    /**
     * @constant
     * @type {Number}
     */
    const helloWorld8 = 1.2345;
    /**
     * @constant
     * @type {Boolean}
     */
    const helloWorld9 = true;
}
