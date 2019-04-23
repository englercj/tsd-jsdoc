// tslint:disable
/// <reference path='dts-jsdoc.d.ts' />
/// <reference path='taffydb.d.ts' />
// tslint:enable

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
    export function find(data: TDocletDb, query: any): Array<(TDoclet | IPackageDoclet)>;
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
    description: string;
    comment: string;
    defaultvalue?: string;
    meta?: any;
    optional?: boolean;
    variable?: boolean;
}

declare interface IDocletReturn {
    type: IDocletType;
    description: string;
}

declare interface IDocletCode {
    id: string;
    name: string;
    type: string;
    value?: string;
    paramnames?: string[];
}

declare interface IDocletMeta {
    range: number[];
    filename: string;
    lineno: number;
    path: string;
    code: IDocletCode;
}

declare interface IDocletTag {
    originalTitle: string;
    title: string;
    text: string;
    value: string;
}

declare interface IDocletBase {
    meta?: IDocletMeta;
    name: string;
    scope: string;
    longname: string;
    variation?: string;
    tags?: IDocletTag[];
    memberof?: string;
    see?: string;
    access?: ('public' | 'private' | 'protected' | 'package');
    examples?: string;
    deprecated?: string;
    defaultvalue?: string;
    comment?: string;
    description?: string;
    ignore?: boolean;
    undocumented?: boolean;
    properties?: IDocletProp[];
    inherits?: string;
    inherited?: boolean;
}

/**
 * Specific doclet types
 */
declare interface IClassDoclet extends IDocletBase {
    kind: 'class' | 'interface' | 'mixin';
    params?: IDocletProp[];
    augments?: string[];
    implements?: string[];
    mixes?: string[];
    virtual?: boolean;
    classdesc?: string;
}

declare interface IFileDoclet extends IDocletBase {
    kind: 'file';
    params?: IDocletProp[];
}

declare interface IEventDoclet extends IDocletBase {
    kind: 'event';
    params?: IDocletProp[];
}

declare interface IFunctionDoclet extends IDocletBase {
    kind: 'function' | 'callback';
    this?: string;
    params?: IDocletProp[];
    returns?: IDocletReturn[];
    override?: boolean;
    virtual?: string[];
}

declare interface IMemberDoclet extends IDocletBase {
    kind: 'member' | 'constant';
    readonly: boolean;
    isEnum: boolean;
    type: IDocletType;
}

declare interface INamespaceDoclet extends IDocletBase {
    kind: 'namespace' | 'module';
}

declare interface ITypedefDoclet extends IDocletBase {
    kind: 'typedef';
    type: IDocletType;

    // function typedef
    this?: string;
    params?: IDocletProp[];
    returns?: IDocletReturn[];
}

declare interface IPackageDoclet {
    kind: 'package';
    longname: string;
    files: string[];
    name?: string;
}

declare type TDoclet = (
    IClassDoclet
    | IEventDoclet
    | IFileDoclet
    | IFunctionDoclet
    | IMemberDoclet
    | INamespaceDoclet
    | ITypedefDoclet
);

declare type TAnyDoclet = TDoclet | IPackageDoclet;
