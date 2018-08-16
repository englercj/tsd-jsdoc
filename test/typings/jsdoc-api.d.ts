declare module 'jsdoc-api' {
    export function explain(options: any): Promise<any[]>;
    export function explainSync(options: any): any[];
    export function renderSync(options: any): void;
}
