declare module "properties" {
    /**
     * @property myProp - foobar
     */
    class PropTest1 {
        /**
         * foobar
        */
        myProp: string;
    }
    class PropTest2 {
        otherProp: number;
        myProp: number;
    }
    class PropTest3 {
        /**
         * duplicate
         */
        myProp: boolean;
    }
    /**
     * @property myProp - foobar
     */
    class PropTest4 {
        constructor();
        /**
         * foobar
        */
        myProp: string;
    }
    class PropTest5 {
        constructor();
        otherProp: number;
        myProp: number;
    }
    class PropTest6 {
        constructor();
        /**
         * duplicate
         */
        myProp: boolean;
    }
    class PropTest7 {
        constructor();
        myProps: {
            foo: number;
            bar: boolean;
            test1: string;
            test2?: string[];
        }[];
    }
}
