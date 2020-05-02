declare module "interfaces" {
    namespace Color {
        function staticMethod1(): void;
        function staticMethod2(): void;
        var staticMember1: number;
        var staticMember2: boolean;
        var staticMember3: string;
        var staticMember4: any;
    }
    /**
     * Interface for classes that represent a color.
     */
    interface Color {
        instanceMethod(): void;
        instanceMember: number;
        /**
         * Get the color as an array of red, green, and blue values, represented as
         * decimal numbers between 0 and 1.
         * @returns An array containing the red, green, and blue values,
         * in that order.
         */
        rgb(): number[];
        foobar1?(): void;
        foobar2?(): void;
        foobar3?: boolean;
        foobar4?: string;
        foobar5?: any;
    }
}
