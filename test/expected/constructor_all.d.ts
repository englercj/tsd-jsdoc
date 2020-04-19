declare module "constructors" {
    /**
     * Class documentation.
     */
    class MyClass0 {
        /**
         * Default constructor documentation.
         */
        constructor(a: number, b: string);
    }
    /**
     * Class documentation.
     */
    class MyClass1 {
        /**
         * '@public' constructor documentation.
         */
        public constructor(a: number, b: string);
    }
    /**
     * Class documentation.
     */
    class MyClass2 {
        /**
         * '@protected' constructor documentation.
         */
        protected constructor(a: number, b: string);
    }
    /**
     * Class documentation.
     */
    class MyClass3 {
        /**
         * '@package' constructor documentation.
         */
        private constructor(a: number, b: string);
    }
    /**
     * Class documentation.
     */
    class MyClass4 {
        /**
         * '@private' constructor documentation.
         */
        private constructor(a: number, b: string);
    }
    /**
     * Class documentation only.
     */
    class MyClass5 {
        constructor(a: number, b: string);
    }
    class MyClass6 {
        /**
         * Constructor documentation only.
         */
        constructor(a: number, b: string);
    }
}
