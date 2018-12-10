declare function doStuff(): void;

declare class OtherThing {
    copy(): void;
}

declare class Stuff {
    doStuff(): void;
}

declare class Things {
    doThings(): void;
}

declare class DeepClass1 {
}

declare module DeepClass1 {
    class DeepClass2 {
    }
    module DeepClass2 {
        class DeepClass3 {
        }
        module DeepClass3 {
            class DeepClass4 {
            }
        }
    }
}

declare module util {
    class MyClass {
        message: string;
    }
    class GitGraph {
    }
    type Something = boolean;
    interface MyThing extends Stuff, Things {
    }
    class MyThing extends OtherThing implements Stuff, Things {
        derp: string;
        map: {
            [key: string]: (number | string)[];
        };
        superArray: string[][][][][];
        static create(opts: FoobarNS.CircleOptions): MyThing;
        promiseMe(): Promise<any>;
        objParam(options: GitGraphOptions): void;
        D: string;
        D: string;
        static me: number;
        copy(): void;
    }
}

