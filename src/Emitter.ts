import * as dom from 'dts-dom';

export default class Emitter {
    results: dom.TopLevelDeclaration[];
    objects: { [key: string]: dom.DeclarationBase };

    constructor(docs: TDoclet[]) {
        this.results = [];
        this.objects = {};

        this._parse(docs);
    }

    emit() {
        return this.results.reduce((out: string, val: dom.TopLevelDeclaration) => out += dom.emit(val), '');
    }

    private _parse(docs: TDoclet[], parent?: TDoclet) {
        findChildrenOf(docs, (parent ? parent.longname : undefined)).forEach((doclet) => {
            // skip items that are not documented
            if (doclet.undocumented) {
                return;
            }

            // parse based on kind
            switch (doclet.kind) {
                case 'class':       this._handleClass(doclet, docs, parent); break;
                case 'constant':    this._handleMember(doclet, docs, parent); break;
                case 'function':    this._handleFunction(doclet, docs, parent); break;
                case 'interface':   this._handleInterface(doclet, docs, parent); break;
                case 'member':      this._handleMember(doclet, docs, parent); break;
                case 'mixin':       this._handleClass(doclet, docs, parent); break;
                case 'module':      this._handleNamespace(doclet, docs, parent); break;
                case 'namespace':   this._handleNamespace(doclet, docs, parent); break;
                case 'typedef':     this._handleTypedef(doclet, docs, parent); break;
            }
        });
    }

    private _handleClass(doclet: IClassDoclet, docs: TDoclet[], parent?: TDoclet) {
        const obj = this.objects[doclet.longname] || dom.create.class(doclet.name);
        this.objects[doclet.longname] = obj;

        obj.jsDocComment = doclet.comment;
        obj.flags = 0;

        // obj.flags |= doclet.virtual ? dom.DeclarationFlags.Abstract : 0;

        // TODO: Resolve these later? May not be created at this point...
        // if (doclet.augments && doclet.augments.length) {
        //     obj.baseType = this.objects[doclet.longname] as dom.ClassDeclaration;
        // }

        // TODO: implements and mixes

        // TODO: generics
        // TODO: scope
    }

    private _handleInterface(doclet: IClassDoclet, docs: TDoclet[], parent?: TDoclet) {
        const obj = dom.create[isInterface ? 'interface' : 'class']
    }

    private _handleMember(doclet: IMemberDoclet, docs: TDoclet[], parent?: TDoclet) {

    }

    private _handleFunction(doclet: IFunctionDoclet, docs: TDoclet[], parent?: TDoclet) {

    }

    private _handleNamespace(doclet: INamespaceDoclet, docs: TDoclet[], parent?: TDoclet) {

    }

    private _handleTypedef(doclet: ITypedefDoclet, docs: TDoclet[], parent?: TDoclet) {

    }

}

function findChildrenOf(docs: TDoclet[], longname?: string) {
    return docs.filter((e) => e.memberof === longname);
}
