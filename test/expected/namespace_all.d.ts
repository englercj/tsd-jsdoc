declare module "namespaces" {
    namespace FoobarNS {
        /**
         * A Foo.
         */
        class Foo<T> {
            /**
             * A generic method.
             * @param f - A function.
             * @param [opt_this = 10] - An object.
             * @param [opt_2 = 10] - An object.
             */
            f<S>(f: FoobarNS.Foo.FCallback, opt_this?: number, opt_2?: number[] | {
                [key: number]: string[];
            }): void;
        }
        namespace Foo {
            /**
             * @param first - The first param.
             * @param second - The second param.
             * @param third - The third param.
             */
            type FCallback = (this: S, first: T, second: number, third: T[]) => any;
        }
        /**
         * A Bar.
         */
        class Bar extends FoobarNS.Foo {
        }
        interface CircleOptions {
            /**
             * Circle radius.
             */
            radius: number;
        }
        /**
         * Set circle style for vector features.
         * @param [opt_options] - Options.
         */
        class Circle {
            constructor(opt_options?: FoobarNS.CircleOptions);
        }
        var helloWorld1: number;
        var helloWorld2: boolean;
        const helloWorld3: string;
        const helloWorld4: number;
        const helloWorld5: boolean;
        const helloWorld6: any;
        const helloWorld7 = "test";
        const helloWorld8 = 1.2345;
        const helloWorld9 = true;
    }
}
