/// <reference path='dts-jsdoc.d.ts' />
/// <reference path='taffydb.d.ts' />

declare type TDocletDb = ITaffyInstance<TDoclet>;

declare module 'jsdoc/env' {
    interface ITemplates {
        jsdoc2tsd: ITemplateConfig;
    }

    interface IConf {
        templates: ITemplates;
    }

    export const conf: IConf;
}

declare module 'jsdoc/util/templateHelper' {
    export function find(data: TDocletDb, query: any): TDoclet[];
}


/**
 * Doclet Base and util types
 */
declare interface IDocletType {
    names: string[];
}

declare interface IDocletProp {
    type: IDocletType;
    name: string;
    description?: string;
}

declare interface IDocletMeta {
    range: number[];
    filename: string;
    lineno: number;
    path: string;
    code: { id: string, name: string, type: string }
}

declare interface IDocletBase {
    meta: IDocletMeta;
    name: string;
    scope: string;
    longname: string;
    memberof?: string;
    see?: string;
    access?: string;
    examples?: string;
    deprecated?: string;
    defaultvalue?: string;
    comment?: string;
    description?: string;
    ignore?: boolean;
    undocumented?: boolean;
    properties?: IDocletProp[];
}

/**
 * Specific doclet types
 */
declare interface IClassDoclet extends IDocletBase {
    kind: 'class' | 'interface' | 'mixin';
    params: IDocletProp[];
    augments: string[];
    virtual?: boolean;
    classdesc?: string;
}

declare interface IFunctionDoclet extends IDocletBase {
    kind: 'function';
    params: IDocletProp[];
    override?: boolean;
}

declare interface IMemberDoclet extends IDocletBase {
    kind: 'member' | 'constant';
    type: IDocletType;
}

declare interface INamespaceDoclet extends IDocletBase {
    kind: 'namespace' | 'module';
}

declare interface ITypedefDoclet extends IDocletBase {
    kind: 'typedef';
    type: IDocletType;
}

declare interface IPackageDoclet {
    kind: 'package';
    longname: string;
    files: string[];
    name?: string;
}

declare type TDoclet = (
    IClassDoclet
    | IFunctionDoclet
    | IMemberDoclet
    | INamespaceDoclet
    | ITypedefDoclet
);
