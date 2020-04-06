/**
 * @property myProp - foobar
 */
declare class PropTest1 {
    /**
     * foobar
    */
    myProp: string;
}

declare class PropTest2 {
    otherProp: number;
    myProp: number;
}

declare class PropTest3 {
    /**
     * duplicate
     */
    myProp: boolean;
    /**
     * duplicate
     */
    myProp: boolean;
    myProp: boolean;
}

/**
 * @property myProp - foobar
 */
declare class PropTest4 {
    constructor();
    /**
     * foobar
    */
    myProp: string;
}

declare class PropTest5 {
    constructor();
    otherProp: number;
    myProp: number;
}

declare class PropTest6 {
    constructor();
    /**
     * duplicate
     */
    myProp: boolean;
    /**
     * duplicate
     */
    myProp: boolean;
    myProp: boolean;
}

declare class PropTest7 {
    constructor();
    myProps: {
        foo: number;
        bar: boolean;
        test1: string;
        test2?: string[];
    }[];
}
