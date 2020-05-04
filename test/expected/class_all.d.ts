declare module "util" {
    function doStuff(this: OtherThing): void;
    class OtherThing {
        copy(): void;
    }
    class Stuff {
        doStuff(): void;
    }
    class BaseClass {
        baseFunc(): void;
        baseFuncOverridden(): void;
    }
    class DerivedClass extends BaseClass {
        derivedFunc(): void;
        baseFuncOverridden(): void;
    }
    class Things {
        doThings(): void;
        foobar1?(): void;
        foobar2?: number;
    }
    /**
     * Deep class #1
     */
    class DeepClass1 {
        constructor();
    }
    namespace DeepClass1 {
        /**
         * Deep class #2
         */
        class DeepClass2 {
            constructor();
        }
        namespace DeepClass2 {
            /**
             * Deep class #3
             */
            class DeepClass3 {
                constructor();
            }
            namespace DeepClass3 {
                /**
                 * Deep class #4
                 */
                class DeepClass4 {
                    constructor();
                }
            }
        }
    }
    class MyClass {
        constructor(message: string);
        message: string;
    }
    /**
     * GitGraph
     * @param options - GitGraph options
     * @param [options.elementId = "gitGraph"] - Id of the canvas container
     * @param [options.template] - Template of the graph
     * @param [options.author = "Sergio Flores <saxo-guy@epic.com>"] - Default author for commits
     * @param [options.mode = (null|"compact")] - Display mode
     * @param [options.canvas] - DOM canvas (ex: document.getElementById("id"))
     * @param [options.orientation = ("vertical-reverse"|"horizontal"|"horizontal-reverse")] - Graph orientation
     * @param [options.reverseArrow = false] - Make arrows point to ancestors if true
     * @param [options.initCommitOffsetX = 0] - Add custom offsetX to initial commit.
     * @param [options.initCommitOffsetY = 0] - Add custom offsetY to initial commit.
     * @param [options.tooltipContainer = document.body] - HTML Element containing tooltips in compact mode.
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
    type Something = boolean;
    interface MyThing extends Stuff, Things {
    }
    class MyThing extends OtherThing implements Stuff, Things {
        /**
         * Constructs!
         * @param a - The number.
         */
        private constructor(...a: number[]);
        /**
         * Derp or something.
         */
        readonly derp: string;
        map: {
            [key: string]: (number | string)[];
        };
        superArray: string[][][][][];
        simpleArray: any[];
        /**
         * Creates a new thing.
         * @param opts - Namespace test!
         * @returns the new thing.
         */
        static create(opts: FoobarNS.CircleOptions): MyThing;
        /**
         * Gets a Promise that will resolve with an Object, or reject with OtherThing
         * @returns The Promise
         */
        promiseMe(): Promise<object>;
        /**
         * Gets a Promise that will resolve with an array of OtherThings
         * @returns The Promise
         */
        promiseYou(): Promise<OtherThing[]>;
        /**
         * Gets a Promise that will resolve with a bunch of possible types
         * @returns The Promise
         */
        promiseFoo(): Promise<any[] | object | number | string>;
        /**
         * Gets a Promise that will resolve with an object with complex properties
         * @returns The Promise
         */
        promiseBar(): Promise<{ newChannels: Channel[]; foo: Bar; }>;
        /**
         * Gets a Promise that will resolve with a generic function
         * @returns The Promise
         */
        promiseGenericFunc(): Promise<(...params: any[]) => void>;
        /**
         * Gets a Promise that will resolve with a function with no arguments
         * that returns a string.
         * @returns The Promise
         */
        promiseStringFunc(): Promise<(...params: any[]) => string>;
        /**
         * Gets a Promise that will resolve with a function with lots of arguments
         * that returns an object.
         * @returns The Promise
         */
        promiseLotsArgsFunc(): Promise<(arg0: OtherThing[], arg1: object, arg2: number, arg3: string) => object>;
        /**
         * Gets a Promise that will resolve with a function with lots of arguments
         * that returns the default type.
         * @returns The Promise
         */
        promiseDefaultRetFunc(): Promise<(arg0: OtherThing[], arg1: object, arg2: number, arg3: string) => void>;
        /**
         * A param that is a function
         * Note: doesn't matter what I put, a @param only gets "FUNCTION" from jsdoc
         */
        takeFuncParam(f: (...params: any[]) => any): void;
        /**
         * A param that is a complex function
         * Note: doesn't matter what I put, a @param only gets "FUNCTION" from jsdoc
         */
        takeFuncParamComplex(f: (...params: any[]) => any): void;
        /**
         * @param options - GitGraph options
         */
        objParam(options: GitGraphOptions): void;
        /**
         * Gets derp.
         */
        D: string;
        static me: number;
    }
}
