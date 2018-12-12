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
    constructor();
}

declare module DeepClass1 {
    class DeepClass2 {
        constructor();
    }
    module DeepClass2 {
        class DeepClass3 {
            constructor();
        }
        module DeepClass3 {
            class DeepClass4 {
                constructor();
            }
        }
    }
}

declare module util {
    class MyClass {
        constructor(message: string);
        message: string;
    }
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
        constructor(...a: number);
        readonly derp: string;
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

