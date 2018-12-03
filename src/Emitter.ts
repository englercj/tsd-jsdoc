import * as dom from 'dts-dom';
import * as fs from 'fs';
import * as path from 'path';
import { EResolveFailure, warn, warnResolve } from './logger';

const rgxArrayType = /^Array(?:\.<(.*)>)?$/;
const rgxObjectType = /^Object\.<(\w*),\s*\(?(.*)\)?>$/;
const rgxJsDocHeader = /^\/\*\*\s?/;
const rgxJsDocFooter = /\s*\*\/\s?$/;
const rgxJsDocBody = /^\*\s?/;

const RAW_GLOBAL_TYPES: { [id: string]: string[] } = JSON.parse(fs.readFileSync(path.join(__dirname, '../global-types.json')).toString());
const GLOBAL_TYPES: { [id: string]: dom.DeclarationBase } = Object.keys(RAW_GLOBAL_TYPES)
    .reduce(
        (acc, key: string) => {
            RAW_GLOBAL_TYPES[key].forEach((t) => {
                acc[t] = dom.create.namedTypeReference(t);
            });
            return acc;
        },
        {} as any,
    );

// tslint:disable:interface-name
declare module 'dts-dom' {
    export interface DeclarationBase {
        _parent?: DeclarationBase;
        _module?: ModuleDeclaration;
        _doclet?: IDocletBase;
    }

    export interface Parameter {
        _parent: DeclarationBase;
    }
}

// tslint:enable:interface-name

interface IResolutionMap {
    augments: TDoclet[];
    implements: TDoclet[];
    mixes: TDoclet[];
}

const accessFlagMap: { [key: string]: dom.DeclarationFlags } = {
    public: dom.DeclarationFlags.None,
    private: dom.DeclarationFlags.Private,
    protected: dom.DeclarationFlags.Protected,
};

export default class Emitter {
    results: dom.TopLevelDeclaration[];
    objects: { [key: string]: dom.DeclarationBase };

    resolutionNeeded: IResolutionMap;

    constructor(docs?: TDoclet[], public config?: ITemplateConfig, public eol: string = '\n') {
        this.parse(docs);
    }

    parse(docs?: TDoclet[]) {
        this.results = [];
        this.objects = { ...GLOBAL_TYPES };

        if (!docs) {
            return;
        }

        // initial parse, create all the necessary objects and puts them in the
        // `objects` cache
        this._parseObjects(docs);

        // resolve post-parse items (members, augments, implements, mixes, etc)
        this._resolveObjects(docs);

        // resolve interface members, after we resolve all members add missing
        // definitions from implemented interfaces
        this._resolveInterfaceMembers(docs);

        // resolve modules, after everything is ready we need to split typedefs
        // and inner classes into separate module declarations.
        this._resolveModules(this.results);
    }

    emit() {
        dom.config.outputEol = this.eol;

        let out = '';

        for (const res of this.results) {
            out += dom.emit(res);
        }

        return out;
    }

    private _parseObjects(docs: TDoclet[]) {
        for (const doclet of docs) {
            if (!this._shouldResolveDoclet(doclet)) {
                continue;
            }

            if (this.objects[doclet.longname] && !(doclet as IFunctionDoclet).override) {
                continue;
            }

            // parse based on kind
            switch (doclet.kind) {
                case 'class':
                    this._createClass(doclet);
                    break;
                case 'constant':
                    this._createMember(doclet);
                    break;
                case 'function':
                    this._createFunction(doclet);
                    break;
                case 'interface':
                    this._createInterface(doclet);
                    break;
                case 'member':
                    this._createMember(doclet);
                    break;
                case 'mixin':
                    this._createInterface(doclet);
                    break;
                case 'module':
                    this._createNamespace(doclet);
                    break;
                case 'namespace':
                    this._createNamespace(doclet);
                    break;
                case 'typedef':
                    this._createTypedef(doclet);
                    break;
            }

            const obj = this.objects[doclet.longname];

            if (!obj) {
                continue;
            }

            obj.jsDocComment = cleanComment(doclet.comment);

            handleCustomTags(doclet, obj);

            if (!doclet.memberof) {
                this.results.push(obj as dom.TopLevelDeclaration);
            }
        }
    }

    private _resolveObjects(docs: TDoclet[]) {
        for (const doclet of docs) {
            if (!this._shouldResolveDoclet(doclet)) {
                continue;
            }

            const obj = this.objects[doclet.longname];

            if (!obj) {
                warnResolve(doclet, EResolveFailure.Object);
                continue;
            }

            // resolve members
            if (doclet.memberof && !doclet.inherited) {
                const objMember = obj as dom.NamespaceMember | dom.ClassMember;
                const p = this.objects[doclet.memberof] as dom.NamespaceDeclaration | dom.ClassDeclaration;

                if (!p) {
                    warnResolve(doclet, EResolveFailure.Memberof, 'No such name found.');
                }
                else if (!p.members) {
                    warnResolve(
                        doclet,
                        EResolveFailure.Memberof,
                        `Found parent, but it cannot contain members. Discovered type: ${p.kind}.`,
                    );
                }
                else {
                    if (objMember.kind === 'function' && p.kind !== 'namespace') {
                        (objMember as any).kind = 'method';
                    }

                    let isDuplicate = false;
                    for (const member of p.members) {
                        if (member._doclet.longname === objMember._doclet.longname) {
                            isDuplicate = true;
                            break;
                        }
                    }

                    if (isDuplicate) {
                        continue;
                    }

                    obj._parent = p;

                    // Using an any cast here to work around this issue: https://github.com/Microsoft/TypeScript/issues/7294
                    (p.members as any).push(objMember);
                }
            }

            // set typedef parents
            if (doclet.kind === 'typedef' && (obj as any).type) {
                (obj as any).type._parent = obj;
            }

            // resolve function params and return type
            if (doclet.kind === 'function'
                || (doclet.kind === 'typedef' && (obj as any).type && (obj as any).type.kind === 'function-type')
            ) {
                const d = doclet as IFunctionDoclet;
                const o = (doclet.kind === 'typedef' ? (obj as any).type : obj) as dom.MethodDeclaration;

                // resolve parameter types
                if (doclet.params) {
                    o.parameters = this._resolveFunctionParams(doclet.params);
                }

                for (const param of o.parameters) {
                    param._parent = o;
                }

                // resolve return type
                if (!d.returns) {
                    o.returnType = dom.type.void;
                }
                else if (!d.returns[0].type) {
                    warnResolve(d, EResolveFailure.FunctionReturn, `Type is not well-formed, defaulting to any.`);
                    o.returnType = dom.type.any;
                }
                else {
                    o.returnType = this._resolveType(d.returns[0], o);
                }
            }

            // resolve object alias property types
            if (doclet.kind === 'typedef' && (obj as any).type && (obj as any).type.kind === 'object') {
                if (doclet.properties) {
                    (obj as any).type.members = handleNestedProperties(doclet.properties).map((pDoc) => {
                        let propType;
                        if ((Object.keys(pDoc.props).length)) {
                            propType = dom.create.property(pDoc.meta.name, this._walkNestedProps(pDoc), handleFlags(pDoc.meta));

                        } else {
                            propType = dom.create.property(pDoc.meta.name, null, handleFlags(pDoc.meta));
                            propType.type = this._resolveType(pDoc.meta, propType);
                        }

                        propType.jsDocComment = cleanComment(pDoc.meta.comment);
                        propType._doclet = doclet;

                        return propType;
                    });
                }

                (obj as any).type.members.forEach((m: any) => {
                    m._parent = (obj as any).type;
                });
            }

            // resolve alias types
            if (doclet.kind === 'typedef' && !(obj as any).type) {
                (obj as dom.TypeAliasDeclaration).type = this._resolveType(doclet, obj as dom.TypeAliasDeclaration);
            }

            // resolve member types
            if (doclet.kind === 'member' || doclet.kind === 'constant') {
                // member with no type is likely setter
                if (!doclet.type && !doclet.properties) {
                    continue;
                }

                (obj as dom.PropertyDeclaration).type = this._resolveType(doclet, obj as dom.PropertyDeclaration);
            }

            // resolve class heirarchy
            if (doclet.kind === 'class' || doclet.kind === 'mixin' || doclet.kind === 'interface') {
                const o = obj as (dom.ClassDeclaration | dom.InterfaceDeclaration);

                // resolve constructor types
                let ctorObj: dom.ConstructorDeclaration = null;

                if (o.members && typeof o.members[Symbol.iterator] === 'function') {
                    for (const member of o.members) {
                        if (member.kind === 'constructor') {
                            ctorObj = member as dom.ConstructorDeclaration;
                        }
                    }
                } else {
                    warn(`No members specified for ${doclet.kind} ${doclet.name} in ${doclet.meta.filename}`);
                }

                if (ctorObj) {
                    if (doclet.params) {
                        ctorObj.parameters = this._resolveFunctionParams(doclet.params);
                    }
                    for (const param of ctorObj.parameters) {
                        param._parent = ctorObj;
                    }
                }

                // resolve augments
                if (doclet.augments && doclet.augments.length) {
                    const baseType = this.objects[doclet.augments[0]] as dom.ClassDeclaration | dom.InterfaceDeclaration;

                    if (!baseType) {
                        warnResolve(doclet, EResolveFailure.Augments);
                    }
                    else {
                        if (o.kind === 'class') {
                            o.baseType = baseType;
                        }
                        else {
                            o.baseTypes.push(baseType);
                        }
                    }
                }

                // resolve implements
                if (doclet.implements && doclet.implements.length) {
                    if (o.kind === 'class') {
                        o.implements.push.apply(o.implements, doclet.implements.map((s) => this.objects[s]));
                    }
                    else {
                        o.baseTypes.push.apply(o.baseTypes, doclet.implements.map((s) => this.objects[s]));
                    }
                }

                // resolve mixes
                if (doclet.mixes && doclet.mixes.length) {
                    for (const mix of doclet.mixes) {
                        const declaration = this.objects[mix] as dom.InterfaceDeclaration;

                        if (o.kind === 'class') {
                            o.implements.push(declaration);
                        }
                        else {
                            o.baseTypes.push(declaration);
                        }
                    }
                }
            }
        }
    }

    private _resolveInterfaceMembers(docs: TDoclet[]) {
        for (const doclet of docs) {
            if (!this._shouldResolveDoclet(doclet)) {
                continue;
            }

            const obj = this.objects[doclet.longname] as dom.ClassDeclaration;

            if (!obj) {
                warnResolve(doclet, EResolveFailure.Object);
                continue;
            }

            if (obj.kind === 'class') {
                // iterate each interface we implement
                for (const impl of obj.implements) {

                    // iterate each member of that interface
                    for (const implMemb of impl.members) {
                        const implMember = { ...implMemb } as any;
                        // skip members that don't have a name-attribute
                        if (implMember.kind === 'call-signature') {
                            continue;
                        }
                        let clsMember: dom.ClassMember = null;

                        // search for member in class
                        for (const member of obj.members) {

                            if (member.kind === 'constructor') {
                                continue;
                            }

                            if (member.name === implMember.name) {
                                clsMember = member;
                                break;
                            }
                        }

                        if (implMember.kind === 'property' && implMember.type.kind === 'function-type') {
                            implMember.kind = 'method';
                        }

                        // if class doesn't contain a member of the same type, then add it
                        if (!objEqual(clsMember, implMember)) {
                            obj.members.push(implMember);
                        }
                    }
                }
            }
        }
    }

    private _resolveModules(classes: any[]) {
        for (let i = classes.length - 1; i >= 0; --i) {
            const res = classes[i];

            if (res.kind === 'class' || res.kind === 'interface') {
                this._doResolveClassModule(res);
            }
            else if (res.kind === 'module' || res.kind === 'namespace') {
                this._resolveModules(res.members);
            }
        }
    }

    private _doResolveClassModule(clazz: dom.ClassDeclaration | dom.InterfaceDeclaration) {
        for (const m of clazz.members) {
            const member = m as any;

            if (member.kind === 'class' || member.kind === 'interface') {
                this._moveMemberToModule(member);
                this._doResolveClassModule(member);
            }
            else if (member.kind === 'alias') {
                this._moveMemberToModule(member);
            }
        }
    }

    private _moveMemberToModule(obj: dom.ClassDeclaration | dom.InterfaceDeclaration | dom.TypeAliasDeclaration) {
        const parent = obj._parent as any;
        const idx: number = parent.members.indexOf(obj);
        const top = parent._parent;

        if (!parent._module) {
            parent._module = dom.create.module(parent.name);

            if (top) {
                (top._module || top).members.push(parent._module);
            } else {
                this.results.push(parent._module);
            }
        }

        parent._module.members.push(obj);
        parent.members.splice(idx, 1);
    }

    private _resolveType(
        doclet: ITypedefDoclet | IMemberDoclet | IDocletProp | IDocletReturn,
        obj: dom.Parameter | dom.PropertyDeclaration | dom.MethodDeclaration | dom.TypeAliasDeclaration,
    ): dom.Type {
        const candidateType = doclet.type || (doclet as any).properties && (doclet as any).properties[0].type;

        if (!candidateType) {
            return dom.type.any;
        }

        const names: string[] = candidateType.names;
        const types: dom.Type[] = [];

        for (const t of names) {
            types.push(this._resolveTypeString(t, doclet, obj));
        }

        if (types.length === 0) {
            return dom.type.any;
        }

        if (types.length > 1) {
            return dom.create.union(types);
        }

        return (doclet as any).variable ? dom.type.array(types[0]) : types[0];
    }

    private _resolveTypeString(
        t: string,
        doclet: ITypedefDoclet | IMemberDoclet | IDocletProp | IDocletReturn,
        obj: dom.Parameter | dom.PropertyDeclaration | dom.MethodDeclaration | dom.TypeAliasDeclaration,
    ): dom.Type {
        if (t.startsWith('(')) {
            t = t.replace('(', '');
        }
        if (t.endsWith(')')) {
            t = t.replace(/\)$/, '');
        }
        if (t.includes('Promise.<')) {
            t = t.replace('Promise.<', 'Promise<');
        }
        if (t.includes('Array.<')) {
            t = t.replace('Array.<', 'Array<');
        }

        // try array type
        if (t.startsWith('Array')) {
            const matches = t.match(rgxArrayType);

            if (matches) {
                if (matches[1]) {
                    return dom.create.array(this._resolveTypeString(matches[1], doclet, obj));
                } else {
                    return dom.create.array(dom.type.any);
                }
            }
        }

        // try object type
        if (t.startsWith('Object.<')) {
            const matches = t.match(rgxObjectType);

            if (matches && matches[1] && matches[2]) {
                const indexTypeStr = matches[1].trim();
                const valueTypeStr = matches[2].trim();

                if (indexTypeStr !== 'string' && indexTypeStr !== 'number') {
                    warn(`Invalid object index type: "${matches[1]}", must be "string" or "number". Falling back to "any".`);
                    return dom.type.any;
                }

                return dom.create.objectType([
                    dom.create.indexSignature(
                        'key',
                        indexTypeStr,
                        this._resolveTypeString(valueTypeStr, doclet, obj),
                    ),
                ]);
            }
        } else if (t.startsWith('Object')) {
            // warn(`Invalid object index type, must be "string" or "number". Falling back to "any".`);
            return dom.type.any;
        }

        // try TypeParameter type
        let p = obj as any;
        while (p) {
            if (p.typeParameters) {
                for (const g of p.typeParameters) {
                    if (t === g.name) {
                        return t as dom.Type;
                    }
                }
            }

            p = p._parent;
        }

        const possiblePrimitive = /^[A-Z]/.test(t) ? t.toLowerCase() : t;

        // try primative type
        if (possiblePrimitive === dom.type.string
            || possiblePrimitive === dom.type.number
            || possiblePrimitive === dom.type.boolean
            || possiblePrimitive === dom.type.true
            || possiblePrimitive === dom.type.false
            || possiblePrimitive === dom.type.object
            || possiblePrimitive === dom.type.any
            || possiblePrimitive === dom.type.null
            || possiblePrimitive === dom.type.undefined
            || possiblePrimitive === dom.type.void) {
            return possiblePrimitive;
        }

        if (possiblePrimitive === 'function') {
            return dom.create.functionType([], dom.type.any);
        }

        // any type
        if (t === '*') {
            return dom.type.any;
        }

        // try union type
        if (t.includes('|')) {
            return dom.create.union(t.split('|').map((v) => this._resolveTypeString(v, doclet, obj)));
        }
        // try type lookup
        if (this.objects[t]) {
            return this.objects[t] as dom.TopLevelDeclaration;
        } else {
            try {
                // tslint:disable-next-line:no-eval
                const val = eval(t);
                const evalType = typeof val;

                if (evalType === 'number') {
                    return dom.type.numberLiteral(val);
                } else if (evalType === 'string') {
                    return dom.type.stringLiteral(val);
                } else {
                    warn(`Unable to handle eval type "${evalType}", defaulting to "any"`);
                }
            } catch {
                warn(`Unable to resolve type name "${t}" for "${
                    (doclet as any).longname || doclet.description}". No type found with that name, defaulting to "any".`);
            }
            return dom.type.any;
        }
    }

    private _createClass(doclet: IClassDoclet) {
        const obj = this.objects[doclet.longname] = dom.create.class(doclet.name);

        obj._doclet = doclet;

        if (doclet.params) {
            const ctorParams: dom.Parameter[] = [];

            for (const param of doclet.params) {
                const p = dom.create.parameter(param.name, null, handleParameterFlags(param));
                ctorParams.push(p);
            }

            const ctor = dom.create.constructor(ctorParams, handleFlags(doclet));
            ctor._doclet = doclet;
            obj.members.push(ctor);
        }
    }

    private _createInterface(doclet: IClassDoclet) {
        const obj = this.objects[doclet.longname] = dom.create.interface(doclet.name);
        obj._doclet = doclet;
    }

    private _createMember(doclet: IMemberDoclet) {
        let obj = null;

        if (doclet.isEnum) {
            obj = dom.create.enum(doclet.name, doclet.kind === 'constant');
        }
        else {
            const o = this.objects[doclet.memberof] as any;

            // skip enum props
            if (o && o.kind === 'enum') {
                return;
            }

            obj = o && o.kind === 'namespace'
                ? dom.create.const(doclet.name, null, handleFlags(doclet))
                : dom.create.property(doclet.name, null, handleFlags(doclet));
        }

        obj._doclet = doclet;

        this.objects[doclet.longname] = obj;

        if (doclet.isEnum && doclet.properties) {
            for (const property of doclet.properties) {
                const propNode = property.meta.code;
                const val = dom.create.enumValue(propNode.name);

                val.jsDocComment = cleanComment(property.comment);

                (obj as dom.EnumDeclaration).members.push(val);
            }
        }
    }

    private _createFunction(doclet: IFunctionDoclet) {
        // Here use empty params array, it will be handled in the next step in @see _resolveObjects
        const obj = this.objects[doclet.longname] = dom.create.function(doclet.name, [], null, handleFlags(doclet));
        obj._doclet = doclet;
    }

    private _createNamespace(doclet: INamespaceDoclet) {
        const obj = this.objects[doclet.longname] = dom.create.namespace(doclet.name);
        obj._doclet = doclet;
    }

    private _createTypedef(doclet: ITypedefDoclet) {
        if (!doclet.type || !doclet.type.names || !doclet.type.names.length) {
            warn(`No type specified on typedef "${doclet.longname}", assuming "object".`);
            doclet.type = { names: ['object'] };
        }

        const typeName = doclet.type.names[0];
        let type = null;

        switch (typeName.toLowerCase()) {
            case 'function':
                // Here use empty params array, it will be handled in the next step in @see _resolveObjects
                type = dom.create.functionType([], null);
                break;

            case 'object':
                // Here use empty properties array, it will be handled in the next step in @see _resolveObjects
                type = dom.create.objectType([]);
                break;
        }

        const obj = this.objects[doclet.longname] = dom.create.alias(doclet.name, type, handleFlags(doclet));
        obj._doclet = doclet;
    }

    private _shouldResolveDoclet(doclet: TDoclet) {
        const parent = this.objects[doclet.memberof];

        return (
            !doclet.ignore
            && (doclet as any).kind !== 'package'
            && (!parent || (parent as any).kind !== 'enum')
            && (this.config.private || doclet.access !== 'private')
        );
    }

    private _resolveFunctionParams(params: IDocletProp[]) {
        return handleNestedProperties(params).map((p) => {
            if ((Object.keys(p.props).length)) {
                const param = dom.create.parameter(p.meta.name, this._walkNestedProps(p), handleParameterFlags(p.meta));
                return param;
            } else {
                const param = dom.create.parameter(p.meta.name, null, handleParameterFlags(p.meta));
                param.type = this._resolveType(p.meta, param);
                return param;
            }
        });
    }

    private _walkNestedProps(p: INestedPropsCache) {
        const props = Object.keys(p.props).map((pKey) => {
            return this._walkNestedProp(p.props[pKey], pKey);
        });
        return dom.create.objectType(props);
    }

    private _walkNestedProp(p: INestedPropsCache, key?: string) {
        const hasNestProps = Object.keys(p.props).length;
        const param = dom.create.property(key, hasNestProps ? this._walkNestedProps(p) : null, handleFlags(p.meta));
        param.type = this._resolveType(p.meta, param);

        return param;
    }
}

function handleFlags(doclet: any) {
    let flags = dom.DeclarationFlags.None;

    flags |= accessFlagMap[doclet.access];
    flags |= doclet.optional || doclet.defaultvalue !== undefined ? dom.DeclarationFlags.Optional : dom.DeclarationFlags.None;
    flags |= doclet.virtual ? dom.DeclarationFlags.Abstract : dom.DeclarationFlags.None;
    flags |= doclet.readonly ? dom.DeclarationFlags.ReadOnly : dom.DeclarationFlags.None;
    flags |= doclet.scope === 'static' ? dom.DeclarationFlags.Static : dom.DeclarationFlags.None;

    return flags;
}

function handleParameterFlags(doclet: any) {
    let flags = dom.ParameterFlags.None;

    flags |= accessFlagMap[doclet.access];
    flags |= doclet.optional || doclet.defaultvalue !== undefined ? dom.ParameterFlags.Optional : dom.ParameterFlags.None;
    flags |= doclet.variable ? dom.ParameterFlags.Rest : dom.ParameterFlags.None;

    return flags;
}

function handleCustomTags(doclet: TDoclet, obj: dom.DeclarationBase) {
    if (!doclet.tags || !doclet.tags.length) {
        return;
    }

    for (const tag of doclet.tags) {
        switch (tag.title) {
            case 'template':
                (obj as dom.ClassDeclaration).typeParameters.push(dom.create.typeParameter(tag.value));
                break;
        }
    }
}

interface INestedPropsCache {
    props: {
        [idx: string]: INestedPropsCache;
    };
    meta?: IDocletProp;
}

function handleNestedProperties(properties: IDocletProp[]) {
    const nestedCache: INestedPropsCache = { props: {} };
    const nestedProps: INestedPropsCache[] = [];

    properties.forEach((prop) => {
        const segs = prop.name ? prop.name.split('.') : [];

        if (!nestedCache.props[segs[0]]) {
            makeNestObject(segs, nestedCache, prop);
            nestedProps.push(nestedCache.props[segs[0]]);
        } else {
            makeNestObject(segs, nestedCache, prop);
        }
    });

    return nestedProps;
}

function makeNestObject(segs: string[], context: INestedPropsCache, meta: IDocletProp) {
    for (const seg of segs) {
        context.props[seg] = context.props[seg] || { meta: null, props: {} };
        context = context.props[seg];
    }
    context.meta = { ...meta, name: meta.name.split('.').pop() };
}

function objEqual(o1: any, o2: any) {
    if (!o1 || !o2) {
        return (o1 === o2);
    }

    for (const k in o1) {
        if (o1[k] !== o2[k]) {
            return false;
        }
    }

    for (const k in o2) {
        if (o2[k] !== o1[k]) {
            return false;
        }
    }

    return true;
}

function cleanComment(s: string) {
    if (!s) {
        return '';
    }

    const cleanLines = [];

    for (const line of s.split(/\r?\n/g)) {
        const cleaned = line.trim()
            .replace(rgxJsDocHeader, '')
            .replace(rgxJsDocFooter, '')
            .replace(rgxJsDocBody, '');

        if (cleaned) {
            cleanLines.push(cleaned);
        }
    }

    return cleanLines.join('\n');
}
