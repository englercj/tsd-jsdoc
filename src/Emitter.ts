import * as dom from 'dts-dom';

const rgxArrayType = /^Array\.<(.*)>$/;
const rgxObjectType = /^Object\.<(\w*),\s*\(?(.*)\)?>$/;
const rgxJsDocHeader = /^\/\*\*\s?/;
const rgxJsDocFooter = /\s*\*\/\s?$/;
const rgxJsDocBody = /^\*\s?/;

// TODO: Bug, namespaces in param types incorrect (see: MyThing#create).
// TODO: Built-in, non-primative types (Promise<T>, HTML, etc).

const enum EResolveFailure {
    Memberof,
    Object,
    NoType,
    Augments,
    FunctionParam,
    FunctionReturn,
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

function warnResolve(doclet: TDoclet, reason: EResolveFailure, message: string = '') {
    let str = '';

    switch (reason) {
        case EResolveFailure.Memberof:
            str = `Unable to resolve memberof for "${doclet.longname}", using memberof "${doclet.memberof}".`;
        break;

        case EResolveFailure.Object:
            str = `Unable to find object for longname "${doclet.longname}".`;
        break;

        case EResolveFailure.NoType:
            str = `Type is required for doclet of type "${doclet.kind}" but none found for "${doclet.longname}".`;
        break;

        case EResolveFailure.Augments:
            str = `Failed to resolve base type of "${doclet.longname}", no object found with name "${(doclet as any).augments[0]}".`;
        break;

        case EResolveFailure.FunctionParam:
            str = `Unable to resolve function param type for longname "${doclet.longname}".`;
        break;

        case EResolveFailure.FunctionReturn:
            str = `Unable to resolve function return type for longname "${doclet.longname}".`;
        break;
    }

    if (message) {
        str += ` ${message}`;
    }

    warn(str);
}

export default class Emitter {
    results: dom.TopLevelDeclaration[];
    objects: { [key: string]: dom.DeclarationBase };

    resolutionNeeded: IResolutionMap;

    constructor(docs?: TDoclet[], public config?: ITemplateConfig, public eol: string = '\n') {
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
            if (doclet.ignore)
                continue;

            if (this.objects[doclet.longname] && !(doclet as IFunctionDoclet).override)
                continue;

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

            if (!obj) continue;

            obj.jsDocComment = cleanComment(doclet.comment);

            handleFlags(doclet, obj);
            handleCustomTags(doclet, obj);

            if (!doclet.memberof) {
                this.results.push(obj as dom.TopLevelDeclaration);
            }
        }
    }

    private _resolveObjects(docs: TDoclet[]) {
        for (const doclet of docs) {
            // skip a few things
            if (!this._shouldResolveDoclet(doclet)) continue;

            const obj = this.objects[doclet.longname];

            if (!obj) {
                warnResolve(doclet, EResolveFailure.Object);
                continue;
            }

            // resolve members
            if (doclet.memberof && !doclet.inherited) {
                const p = this.objects[doclet.memberof] as dom.NamespaceDeclaration;

                if (!p) {
                    warnResolve(doclet, EResolveFailure.Memberof, 'No such name found.');
                }
                else if (!p.members) {
                    warnResolve(doclet, EResolveFailure.Memberof, `Found parent, but it cannot contain members. Discovered type: ${p.kind}.`);
                }
                else {
                    if ((obj as any).kind === 'function')
                        (obj as any).kind = 'method';

                    // already have something of this name, ignore.
                    if (p.members.filter((v) => v.name === (obj as any).name).length)
                        continue;

                    (obj as any)._parent = p;
                    p.members.push(obj as dom.NamespaceMember);
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
                for (let i = 0; i < o.parameters.length; ++i) {
                    (o.parameters[i] as any)._parent = o;
                    if (!d.params[i].type) {
                        warnResolve(d, EResolveFailure.FunctionParam, `No type specified for param: ${d.params[i].name}. Falling back to any.`);
                        o.parameters[i].type = dom.type.any;
                    }
                    else {
                        o.parameters[i].type = this._resolveType(d.params[i], o.parameters[i]);
                    }
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
                const members = (obj as any).type.members as dom.ObjectTypeMember[];
                for (let i = 0; i < members.length; ++i) {
                    const m = members[i] as dom.PropertyDeclaration;

                    (m as any)._parent = (obj as any).type;

                    m.type = this._resolveType(doclet.properties[i], m);
                }
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

                for (let i = 0; i < o.members.length; ++i) {
                    if (o.members[i].kind === 'constructor') {
                        ctorObj = o.members[i] as dom.ConstructorDeclaration;
                    }
                }

                if (ctorObj) {
                    for (let i = 0; i < doclet.params.length; ++i) {
                        (ctorObj.parameters[i] as any)._parent = ctorObj;
                        if (!doclet.params[i].type) {
                            warnResolve(doclet, EResolveFailure.FunctionParam, `No type specified for constructor param: ${doclet.params[i].name}. Falling back to any.`);
                            ctorObj.parameters[i].type = dom.type.any;
                        }
                        else {
                            ctorObj.parameters[i].type = this._resolveType(doclet.params[i], ctorObj.parameters[i]);
                        }
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

            // skip a few things
            if (!this._shouldResolveDoclet(doclet)) continue;

            const obj = this.objects[doclet.longname] as dom.ClassDeclaration;

            if (!obj) {
                warnResolve(doclet, EResolveFailure.Object);
                continue;
            }

            if (obj.kind === 'class') {
                // iterate each interface we implement
                for (let i = 0; i < obj.implements.length; ++i) {
                    const impl = obj.implements[i];

                    // iterate each member of that interface
                    for (let j = 0; j < impl.members.length; ++j) {
                        const implMember = Object.assign({}, impl.members[j]);
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

                        implMember.kind = 'method';

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
            else if (res.kind === 'interfact' || res.kind === 'module' || res.kind === 'namespace') {
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
        const parent = (obj as any)._parent;
        const idx: number = parent.members.indexOf(obj);
        const top = parent._parent;

        if (!parent._module) {
            parent._module = dom.create.module(parent.name);

            if (top)
                (top._module || top).members.push(parent._module);
            else
                this.results.push(parent._module);
        }

        parent._module.members.push(obj);
        parent.members.splice(idx, 1);
    }

    private _resolveType(
        doclet: ITypedefDoclet|IMemberDoclet|IDocletProp|IDocletReturn,
        obj: dom.Parameter|dom.PropertyDeclaration|dom.MethodDeclaration|dom.TypeAliasDeclaration
    ): dom.Type {
        const names: string[] = (doclet.type || (doclet as any).properties[0].type).names;
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

        return types[0];
    }

    private _resolveTypeString(
        t: string,
        doclet: ITypedefDoclet|IMemberDoclet|IDocletProp|IDocletReturn,
        obj: dom.Parameter|dom.PropertyDeclaration|dom.MethodDeclaration|dom.TypeAliasDeclaration
    ): dom.Type {
        if (t.startsWith('('))
            t = t.replace('(', '');
        if (t.endsWith(')'))
            t = t.replace(/\)$/, '');

        // try array type
        if (t.startsWith('Array.<')) {
            const matches = t.match(rgxArrayType);

            if (matches && matches[1]) {
                return dom.create.array(this._resolveTypeString(matches[1], doclet, obj));
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
                        this._resolveTypeString(valueTypeStr, doclet, obj)
                    )
                ]);
            }
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

        // try primative type
        if (t === dom.type.string
            || t === dom.type.number
            || t === dom.type.boolean
            || t === dom.type.any
            || t === dom.type.void) {
            return t;
        }

        // any type
        if (t === '*') {
            return dom.type.any;
        }

        // try union type
        if (t.indexOf('|') !== -1) {
            return dom.create.union(t.split('|').map((v) => this._resolveTypeString(v, doclet, obj)));
        }

        // try type lookup
        if (!this.objects[t]) {
            warn(`Unable to resolve type name "${t}". No type found with that name, defaulting to "any".`);
            return dom.type.any;
        }

        return this.objects[t] as dom.TopLevelDeclaration;
    }

    private _createClass(doclet: IClassDoclet) {
        const obj = this.objects[doclet.longname] = dom.create.class(doclet.name);

        if (doclet.params) {
            const ctorParams: dom.Parameter[] = [];

            for (let i = 0; i < doclet.params.length; ++i) {
                const param = doclet.params[i];
                const p = dom.create.parameter(param.name, null);

                handleFlags(param, p);

                ctorParams.push(p);
            }

            const ctor = dom.create.constructor(ctorParams);
            handleFlags(doclet, ctor);
            obj.members.push(ctor);
        }
    }

    private _createInterface(doclet: IClassDoclet) {
        this.objects[doclet.longname] = dom.create.interface(doclet.name);
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

                val.jsDocComment = cleanComment(doclet.properties[i].comment);

                (obj as dom.EnumDeclaration).members.push(val);
            }
        }
    }

    private _createFunction(doclet: IFunctionDoclet) {
        this.objects[doclet.longname] = dom.create.function(doclet.name, getFunctionParams(doclet), null);
    }

    private _createNamespace(doclet: INamespaceDoclet) {
        this.objects[doclet.longname] = dom.create.namespace(doclet.name);
    }

    private _createTypedef(doclet: ITypedefDoclet) {
        if (!doclet.type || !doclet.type.names || !doclet.type.names.length) {
            warnResolve(doclet, EResolveFailure.NoType, 'Skipping this typedef, this may cause TypeScript errors.');
            return;
        }

        const typeName = doclet.type.names[0];
        let type = null;

        switch (typeName) {
            case 'function':
                type = dom.create.functionType(getFunctionParams(doclet), null);
            break;

            case 'object':
                type = dom.create.objectType(doclet.properties.map((p) => {
                    const prop = dom.create.property(p.name, null);
                    prop.jsDocComment = cleanComment(p.comment);
                    return prop;
                }));
            break;
        }

        this.objects[doclet.longname] = dom.create.alias(doclet.name, type);
    }

    private _shouldResolveDoclet(doclet: TDoclet) {
        const parent = this.objects[doclet.memberof];

        return (
            !doclet.ignore
            && (doclet as any).kind !== 'package'
            && (!parent || (parent as any).kind !== 'enum')
            && (this.config.private === false && doclet.access !== 'private')
            && (doclet.kind !== 'typedef' || (doclet.type && doclet.type.names && doclet.type.names.length))
        );
    }

}

function handleFlags(doclet: any, obj: dom.DeclarationBase|dom.Parameter) {
    obj.flags = dom.DeclarationFlags.None;

    obj.flags |= accessFlagMap[doclet.access];
    obj.flags |= doclet.optional || doclet.defaultvalue !== undefined ? dom.ParameterFlags.Optional : dom.DeclarationFlags.None;
    obj.flags |= doclet.variable ? dom.ParameterFlags.Rest : dom.DeclarationFlags.None;
    obj.flags |= doclet.virtual ? dom.DeclarationFlags.Abstract : dom.DeclarationFlags.None;
    obj.flags |= doclet.readonly ? dom.DeclarationFlags.ReadOnly : dom.DeclarationFlags.None;
    obj.flags |= doclet.scope === 'static' ? dom.DeclarationFlags.Static : dom.DeclarationFlags.None;
}

function handleCustomTags(doclet: TDoclet, obj: dom.DeclarationBase) {
    if (!doclet.tags || !doclet.tags.length)
        return;

    for (const tag of doclet.tags) {
        switch (tag.title) {
            case 'template':
                (obj as dom.ClassDeclaration).typeParameters.push(dom.create.typeParameter(tag.value));
            break;
        }
    }
}

function getFunctionParams(doclet: IFunctionDoclet|ITypedefDoclet) {
    const fnParams: dom.Parameter[] = [];

    if (doclet.params) {
        for (let i = 0; i < doclet.params.length; ++i) {
            const param = doclet.params[i];
            const p = dom.create.parameter(param.name, null);

            handleFlags(param, p);

            fnParams.push(p);
        }
    }

    return fnParams;
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
    if (!s) return '';

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
