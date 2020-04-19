declare module "functions" {
    function test1(a?: number, input: {
        x: number;
        y: number;
    }): void;
    function test2(x: any[], y: any[], z: any[], w: any[][]): void;
    function test3(myObjs: {
        foo: number;
        bar: boolean;
        test1: string;
        test2?: string[];
    }[]): void;
    class Test12345 {
        static f(): number[];
        static f(key: string): number;
    }
}
