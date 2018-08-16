/**
 * @namespace FoobarNS
 */
declare namespace FoobarNS {
    /**
     * @classdesc
     * A Foo.
     * @constructor
     * @template T
     */
    class Foo<T> {
        /**
         * A generic method.
         * @param {FoobarNS.Foo.FCallback} f A function.
         * @param {S=} opt_this An object.
         * @template S
         */
        f<S>(f: FCallback, opt_this?: any): void;

    }

    /**
     * @classdesc
     * A Bar.
     * @constructor
     * @extends FoobarNS.Foo
     */
    class Bar extends Foo {
        /**
         * A method.
         */
        f(): void;

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
     * @constructor
     * @param {FoobarNS.CircleOptions=} opt_options Options.
     */
    class Circle {
        constructor(opt_options?: CircleOptions);

    }

    module 'Foo' {
        /**
         * @callback FCallback
         * @this S
         * @memberof FoobarNS.Foo
         * @param {T} first - The first param.
         * @param {number} second - The second param.
         * @param {T[]} third - The third param.
         * @returns {*}
         */
        type FCallback = (first: any, second: number, third: any[])=>any;

    }

}
