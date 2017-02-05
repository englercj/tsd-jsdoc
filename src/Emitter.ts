import * as dom from 'dts-dom';

dom.config.wrapJsDocComments = false;

// TODO: generics
// TODO: support
// TODO: defaultvalues

enum EResolveFailure {
    Memberof,
    Object,
    FunctionParam,
}

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

function warn(...args: any[]) {
    args.unshift('[TSD-JSDoc]');
    return console && console.warn.apply(console, args);
}

function warnResolve(doclet: TDoclet, reason: EResolveFailure, message?: string) {
    switch (reason) {
        case EResolveFailure.Memberof:
            warn(`Unable to resolve memberof for "${doclet.longname}", using memberof "${doclet.memberof}". ${message}`);
        break;

        case EResolveFailure.Object:
            warn(`Unable to find object for longname "${doclet.longname}".`);
        break;

        case EResolveFailure.FunctionParam:
            warn(`Unable to resolve function param type for longname "${doclet.longname}".`);
        break;
    }
}

export default class Emitter {
    results: dom.TopLevelDeclaration[];
    objects: { [key: string]: dom.DeclarationBase };

    resolutionNeeded: IResolutionMap;

    constructor(docs?: TDoclet[]) {
        this.parse(docs);
    }

    parse(docs?: TDoclet[]) {
        this.results = [];
        this.objects = {};

        if (!docs) return;

        // initial parse, create all the necessary objects and puts them in the
        // `objects` cache
        this._parseObjects(docs);

        // resolve post-parse items (members, augments, implements, mixes, etc)
        this._resolveObjects(docs);

        // resolve interface members, after we resolve all members add missing
        // definitions from implmented interfaces
        this._resolveInterfaceMembers(docs);
    }

    emit() {
        let out = '';

        for (const res of this.results) {
            out += dom.emit(res);
        }

        return out;
    }

    private _parseObjects(docs: TDoclet[]) {
        for (const doclet of docs) {
            // parse based on kind
            switch (doclet.kind) {
                case 'class':       this._createClass(doclet); break;
                case 'constant':    this._createMember(doclet); break;
                case 'function':    this._createFunction(doclet); break;
                case 'interface':   this._createInterface(doclet); break;
                case 'member':      this._createMember(doclet); break;
                case 'mixin':       this._createInterface(doclet); break;
                case 'module':      this._createNamespace(doclet); break;
                case 'namespace':   this._createNamespace(doclet); break;
                case 'typedef':     this._createTypedef(doclet); break;
            }

            const obj = this.objects[doclet.longname];

            if (obj && !doclet.memberof) {
                this.results.push(obj as dom.TopLevelDeclaration);
            }
        }
    }

    private _resolveObjects(docs: TDoclet[]) {
        for (const doclet of docs) {
            const obj = this.objects[doclet.longname];

            if (!obj) continue;

            // resolve members
            if (doclet.memberof) {
                const p = this.objects[doclet.memberof] as dom.NamespaceDeclaration;

                if (!p) {
                    warnResolve(doclet, EResolveFailure.Memberof, 'No such name found.');
                }
                else if (!p.members) {
                    warnResolve(doclet, EResolveFailure.Memberof, `Found parent, but it cannot contain members. Discovered type: ${p.kind}.`);
                }
                else {
                    p.members.push(obj as dom.NamespaceMember);
                }
            }

            // resolve function params and return type
            if (doclet.kind === 'function') {
                const d = doclet as IFunctionDoclet;
                const o = obj as dom.MethodDeclaration;

                // resolve parameter types
                for (let i = 0; i < o.parameters.length; ++i) {
                    if (!d.params[i].type) {
                        warnResolve(d, EResolveFailure.FunctionParam, `No type specified for param: ${d.params[i].name}.`);
                    }
                    else {
                        o.parameters[i].type = this._resolveType(d.params[i].type);
                    }
                }

                // resolve return type
                if (!d.returns) {
                    o.returnType = 'void';
                }
                else {
                    o.returnType = this._resolveType(d.returns[0].type);
                }
            }

            // resolve member types
            if (doclet.kind === 'member' || doclet.kind === 'constant') {
                // member with no type is likely setter
                if (!doclet.type) {
                    continue;
                }

                (obj as dom.PropertyDeclaration).type = this._resolveType(doclet.type);
            }

            // resolve class heirarchy
            if (doclet.kind === 'class' || doclet.kind === 'mixin' || doclet.kind === 'interface') {
                const o = obj as (dom.ClassDeclaration | dom.InterfaceDeclaration);

                // resolve constructor types
                let ctorObj: dom.ConstructorDeclaration = null;

                for (let i = 0; i < o.members.length; ++i) {
                    if (o.members[i].kind === 'constructor') {
                        ctorObj = o.members[i] as dom.ConstructorDeclaration;
                    }
                }

                if (ctorObj) {
                    for (let i = 0; i < doclet.params.length; ++i) {
                        if (!doclet.params[i].type) {
                            warnResolve(doclet, EResolveFailure.FunctionParam, `No type specified for constructor param: ${doclet.params[i].name}.`);
                        }
                        else {
                            ctorObj.parameters[i].type = this._resolveType(doclet.params[i].type);
                        }
                    }
                }

                // resolve augments
                if (doclet.augments && doclet.augments.length) {
                    if (o.kind === 'class') {
                        o.baseType = this.objects[doclet.augments[0]] as dom.ClassDeclaration;
                    }
                    else {
                        o.baseTypes.push(this.objects[doclet.augments[0]] as dom.InterfaceDeclaration);
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
                    for (let j = 0; j < doclet.mixes.length; ++j) {
                        const mix = this.objects[doclet.mixes[j]] as dom.InterfaceDeclaration;

                        if (o.kind === 'class') {
                            o.implements.push(mix);
                        }
                        else {
                            o.baseTypes.push(mix);
                        }
                    }
                }
            }
        }
    }

    private _resolveInterfaceMembers(docs: TDoclet[]) {
        for (let i = 0; i < docs.length; ++i) {
            const doclet = docs[i];
            const obj = this.objects[doclet.longname] as dom.ClassDeclaration;

            if (!obj) {
                warnResolve(doclet, EResolveFailure.Object);
                return;
            }

            if (obj.kind === 'class') {
                // iterate each interface we implement
                for (let i = 0; i < obj.implements.length; ++i) {
                    const impl = obj.implements[i];

                    // iterate each member of that interface
                    for (let j = 0; j < impl.members.length; ++j) {
                        const implMember = impl.members[j];
                        let clsMember: dom.ClassMember = null;

                        // search for member in class
                        for (let x = 0; x < obj.members.length; ++x) {
                            const mem = obj.members[x];

                            if (mem.kind === 'constructor') {
                                continue;
                            }

                            if ((obj.members[x] as dom.ObjectTypeMember).name === implMember.name) {
                                clsMember = obj.members[x];
                                break;
                            }
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

    private _resolveType(type: IDocletType): dom.Type {
        const names: string[] = type.names;
        const types: dom.Type[] = [];

        for (const t of names) {
            if (t === 'string' || t === 'number' || t === 'boolean' || t === 'any' || t === 'void') {
                types.push(t);
            }
            else {
                if (!this.objects[t]) {
                    warn(`Unable to resolve type name "${t}". No type found with that name.`);
                }
                else {
                    types.push(this.objects[t] as dom.TopLevelDeclaration);
                }
            }
        }

        if (types.length === 0) {
            return 'any';
        }

        if (types.length > 1) {
            return dom.create.union(types);
        }

        return types[0];
    }

    private _createClass(doclet: IClassDoclet) {
        const obj = this.objects[doclet.longname] = dom.create.class(doclet.name);

        obj.jsDocComment = doclet.comment;

        obj.flags = dom.DeclarationFlags.None;
        obj.flags |= doclet.virtual ? dom.DeclarationFlags.Abstract : dom.DeclarationFlags.None;
        obj.flags |= accessFlagMap[doclet.access];
        obj.flags |= doclet.scope === 'static' ? dom.DeclarationFlags.Static : dom.DeclarationFlags.None;

        // TODO: Export flag
        obj.flags |= dom.DeclarationFlags.Export;

        if (doclet.params) {
            const ctorParams: dom.Parameter[] = [];

            for (let i = 0; i < doclet.params.length; ++i) {
                const param = doclet.params[i];
                const flags = (param.optional ? dom.ParameterFlags.Optional : 0) | (param.variable ? dom.ParameterFlags.Rest : 0);

                ctorParams.push(dom.create.parameter(param.name, null, flags));
            }

            const ctorFlags = accessFlagMap[doclet.access];
            obj.members.push(dom.create.constructor(ctorParams, ctorFlags));
        }
    }

    private _createInterface(doclet: IClassDoclet) {
        const obj = this.objects[doclet.longname] = dom.create.interface(doclet.name);

        obj.jsDocComment = doclet.comment;

        obj.flags = dom.DeclarationFlags.None;
        obj.flags |= doclet.virtual ? dom.DeclarationFlags.Abstract : dom.DeclarationFlags.None;
        obj.flags |= accessFlagMap[doclet.access];
        obj.flags |= doclet.scope === 'static' ? dom.DeclarationFlags.Static : dom.DeclarationFlags.None;

        // TODO: Export flag
        obj.flags |= dom.DeclarationFlags.Export;
    }

    private _createMember(doclet: IMemberDoclet) {
        let obj = null;

        if (doclet.isEnum) {
            obj = dom.create.enum(doclet.name, doclet.kind === 'constant');
        }
        else {
            const o = this.objects[doclet.memberof] as dom.EnumDeclaration;

            // skip enum props
            if (o && o.kind === 'enum')
                return;

            obj = dom.create.property(doclet.name, null);
        }

        this.objects[doclet.longname] = obj;

        if (doclet.isEnum && doclet.properties) {
            for (let i = 0; i < doclet.properties.length; ++i) {
                const prop = doclet.properties[i].meta.code;
                const val = dom.create.enumValue(prop.name);

                val.jsDocComment = doclet.properties[i].comment;

                (obj as dom.EnumDeclaration).members.push(val);
            }
        }

        obj.jsDocComment = doclet.comment;

        obj.flags = dom.DeclarationFlags.None;
        obj.flags |= accessFlagMap[doclet.access];
        obj.flags |= doclet.scope === 'static' ? dom.DeclarationFlags.Static : dom.DeclarationFlags.None;
    }

    private _createFunction(doclet: IFunctionDoclet) {
        const fnParams: dom.Parameter[] = [];

        if (doclet.params) {
            for (let i = 0; i < doclet.params.length; ++i) {
                const param = doclet.params[i];
                const flags = (param.optional ? dom.ParameterFlags.Optional : 0) | (param.variable ? dom.ParameterFlags.Rest : 0);

                fnParams.push(dom.create.parameter(param.name, null, flags));
            }
        }

        const obj = this.objects[doclet.longname] = dom.create.function(doclet.name, fnParams, null);

        obj.jsDocComment = doclet.comment;
    }

    private _createNamespace(doclet: INamespaceDoclet) {
        const obj = this.objects[doclet.longname] = dom.create.namespace(doclet.name);

        obj.jsDocComment = doclet.comment;
    }

    private _createTypedef(doclet: ITypedefDoclet) {
        // console.log('TYPEDEF', doclet);
        // TODO: typedef
    }

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
