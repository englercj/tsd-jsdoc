import * as ts from 'typescript';
import { Dictionary } from './Dictionary';
import { warn, debug, docletDebugInfo } from './logger';
import { assertNever } from './assert_never';
import {
    createClass,
    createClassMember,
    createClassMethod,
    createConstructor,
    createEnum,
    createFunction,
    createInterface,
    createInterfaceMember,
    createInterfaceMethod,
    createModule,
    createExportDefault,
    createNamespace,
    createNamespaceMember,
    createTypedef,
} from './create_helpers';

interface IDocletTreeNode
{
    doclet: TDoclet;
    children: IDocletTreeNode[];
    isNested?: boolean;
}

function isDocumented(doclet: TDoclet)
{
    // Same predicate as in publish().
    return (
        (doclet.undocumented !== true)
        && doclet.comment && (doclet.comment.length > 0)
    );
}

function isClassLike(doclet: TDoclet)
{
    return doclet.kind === 'class' || doclet.kind === 'interface' || doclet.kind === 'mixin';
}

function isModuleLike(doclet: TDoclet)
{
    return doclet.kind === 'module' || doclet.kind === 'namespace';
}

function isEnum(doclet: TDoclet)
{
    return (doclet.kind === 'member' || doclet.kind === 'constant') && doclet.isEnum;
}

function isExportDefault(doclet: TDoclet)
{
    return (
        (doclet.kind === 'member') && doclet.longname.startsWith('module:')
        && doclet.meta && (doclet.meta.code.name === "module.exports")
    );
}

function shouldMoveOutOfClass(doclet: TDoclet)
{
    return isClassLike(doclet)
        || isModuleLike(doclet)
        || isEnum(doclet)
        || doclet.kind === 'typedef';
}

function isClassDeclaration(doclet: TDoclet)
{
    return (
        doclet && (doclet.kind === 'class')
        && doclet.meta && (
            // When the owner class's comment contains a @class tag, the first doclet for the class is detached one,
            // btw the 'code' section is empty.
            (! doclet.meta.code.type)
            || (doclet.meta.code.type === 'ClassDeclaration')
        )
    );
}

function isConstructor(doclet: TDoclet)
{
    return (
        (doclet.kind === 'class')
        && doclet.meta && (doclet.meta.code.type === 'MethodDefinition')
    );
}

export class Emitter
{
    results: ts.Node[] = [];

    private _treeRoots: IDocletTreeNode[] = [];
    private _treeNodes: Dictionary<IDocletTreeNode> = {};

    // resolutionNeeded: IResolutionMap;

    constructor(public readonly options: ITemplateConfig)
    { }

    parse(docs?: TAnyDoclet[])
    {
        debug(`Emitter.parse()`);

        this.results = [];
        this._treeRoots = [];
        this._treeNodes = {};

        if (!docs)
            return;

        this._createTreeNodes(docs);
        this._buildTree(docs);
        this._parseTree();
    }

    emit()
    {
        debug(`Emitter.emit()`);

        const resultFile = ts.createSourceFile(
            'types.d.ts',
            '',
            ts.ScriptTarget.Latest,
            false,
            ts.ScriptKind.TS);

        const printer = ts.createPrinter({
            removeComments: false,
            newLine: ts.NewLineKind.LineFeed,
        });

        let out2 = '';

        for (let i = 0; i < this.results.length; ++i)
        {
            out2 += printer.printNode(ts.EmitHint.Unspecified, this.results[i], resultFile);
            out2 += '\n\n';
        }

        return out2;
    }

    private _createTreeNodes(docs: TAnyDoclet[])
    {
        debug(`----------------------------------------------------------------`);
        debug(`Emitter._createTreeNodes()`);

        for (let i = 0; i < docs.length; ++i)
        {
            const doclet = docs[i];

            if (doclet.kind === 'package' || this._ignoreDoclet(doclet))
            {
                debug(`Emitter._createTreeNodes(): skipping ${docletDebugInfo(doclet)} (package or ignored)`);
                continue;
            }

            if (!this._treeNodes[doclet.longname])
            {
                debug(`Emitter._createTreeNodes(): adding ${docletDebugInfo(doclet)} to this._treeNodes`);
                this._treeNodes[doclet.longname] = { doclet, children: [] };
            }
            else
            {
                debug(`Emitter._createTreeNodes(): skipping ${docletDebugInfo(doclet)} (doclet name already known)`);
            }
        }
    }

    private _buildTree(docs: TAnyDoclet[])
    {
        debug(`----------------------------------------------------------------`);
        debug(`Emitter._buildTree()`);

        nextDoclet: for (let i = 0; i < docs.length; ++i)
        {
            const doclet = docs[i];

            // Note: The constructor should be generated with its documentation whatever its access level.
            // Do not move this block after the test below.
            if ((doclet.kind !== 'package') // <= hack for typescript resolutions
                && isConstructor(doclet))
            {
                // If this doclet is a constructor, do not watch the 'memberof' attribute,
                // it usually has the same value as the owner class's declaration,
                // it does point the owner class itself.
                // Use the 'longname' which equals to the owner class's 'longname'.
                const ownerClass = this._treeNodes[doclet.longname];
                if ((!ownerClass) || (!isClassDeclaration(ownerClass.doclet)))
                {
                    warn(`Failed to find owner class of constructor '${doclet.longname}'.`, doclet);
                    continue nextDoclet;
                }
                debug(`Emitter._buildTree(): adding constructor ${docletDebugInfo(doclet)} to class declaration ${docletDebugInfo(ownerClass.doclet)}`);
                ownerClass.children.push({ doclet: doclet, children: [] });

                // When this constructor is not documented, the 'params' field might not be set.
                // Inherit from the owner class when possible, in order to ensure constructor generation with the appropriate parameter list.
                if ((doclet.kind === 'class') && ((! doclet.params) || (doclet.params.length === 0))
                    && (ownerClass.doclet.kind === 'class') && ownerClass.doclet.params && (ownerClass.doclet.params.length > 0))
                {
                    debug(`Emitter._buildTree(): inheriting 'params' from owner class ${docletDebugInfo(ownerClass.doclet)} for undocumented constructor ${docletDebugInfo(doclet)}`);
                    doclet.params = ownerClass.doclet.params;
                }

                // Proceed with the next doclet.
                continue nextDoclet;
            }

            if (doclet.kind === 'package' || this._ignoreDoclet(doclet))
            {
                debug(`Emitter._buildTree(): skipping ${docletDebugInfo(doclet) } (package or ignored)`);
                continue nextDoclet;
            }

            const obj = this._treeNodes[doclet.longname];

            if (!obj)
            {
                warn('Failed to find doclet node when building tree, this is likely a bug.', doclet);
                continue nextDoclet;
            }

            let interfaceMerge: IDocletTreeNode | null = null;

            // Generate an interface of the same name as the class to perform
            // a namespace merge.
            if (doclet.kind === 'class')
            {
                const impls = doclet.implements || [];
                const mixes = doclet.mixes || [];
                const extras = impls.concat(mixes);

                if (extras.length)
                {
                    const interfaceLongname = this._getInterfaceKey(doclet.longname);
                    interfaceMerge = this._treeNodes[interfaceLongname] = {
                        doclet: {
                            kind: 'interface',
                            name: doclet.name,
                            scope: doclet.scope,
                            longname: interfaceLongname,
                            augments: extras,
                            memberof: doclet.memberof,
                        },
                        children: [],
                    };
                    debug(`Emitter._buildTree(): merge interface created for ${docletDebugInfo(doclet)}`);
                }
            }

            if (isExportDefault(doclet))
            {
                const parentModule = this._treeNodes[doclet.longname];
                if (parentModule)
                {
                    debug(`Emitter._buildTree(): adding 'export default' ${docletDebugInfo(doclet)} to module ${docletDebugInfo(parentModule.doclet)}`);
                    parentModule.children.push({ doclet: doclet, children: [] });
                }
                else
                {
                    warn(`Failed to find parent module of 'export default' doclet ${doclet.longname}`, doclet);
                    continue nextDoclet;
                }
            }
            else if (doclet.memberof)
            {
                const parent = this._treeNodes[doclet.memberof];

                if (!parent)
                {
                    warn(`Failed to find parent of doclet '${doclet.longname}' using memberof '${doclet.memberof}', this is likely due to invalid JSDoc.`, doclet);
                    continue nextDoclet;
                }

                const isParentClassLike = isClassLike(parent.doclet);

                // We need to move this into a module of the same name as the parent
                if (isParentClassLike && shouldMoveOutOfClass(doclet))
                {
                    const mod = this._getOrCreateClassNamespace(parent);

                    if (interfaceMerge)
                    {
                        debug(`Emitter._buildTree(): adding ${docletDebugInfo(interfaceMerge.doclet)} to ${docletDebugInfo(mod.doclet)}`);
                        mod.children.push(interfaceMerge);
                    }

                    debug(`Emitter._buildTree(): adding ${docletDebugInfo(obj.doclet)} to ${docletDebugInfo(mod.doclet)}`);
                    mod.children.push(obj);
                }
                else
                {
                    if (! isDocumented(doclet))
                    {
                        // Check this non-documented doclet does not exist yet in the candidate parent's children.
                        for (const child of parent.children)
                        {
                            if ((child.doclet.longname === doclet.longname) && (child.doclet.kind === doclet.kind))
                            {
                                // Do not add the undocumented doclet to the parent twice.
                                debug(`Emitter._buildTree(): skipping undocumented ${docletDebugInfo(doclet)} because ${docletDebugInfo(child.doclet)} is already known in parent ${docletDebugInfo(parent.doclet)}`);
                                /*// Check whether the meta information can be merged.
                                if (doclet.meta && doclet.meta.range
                                    && ((! child.doclet.meta) || (! child.doclet.meta.range)))
                                {
                                    debug(`Emitter._buildTree(): replacing ${docletDebugInfo(child.doclet)}'s meta info with ${docletDebugInfo(doclet)}'s one`);
                                    child.doclet.meta = doclet.meta;
                                    debug(`Emitter._buildTree(): => is now ${docletDebugInfo(child.doclet)}`);
                                }*/
                                continue nextDoclet;
                            }
                        }
                    }

                    const isObjModuleLike = isModuleLike(doclet);
                    const isParentModuleLike = isModuleLike(parent.doclet);

                    if (isObjModuleLike && isParentModuleLike)
                        obj.isNested = true;

                    const isParentEnum = isEnum(parent.doclet);

                    if (!isParentEnum)
                    {
                        if (interfaceMerge)
                        {
                            debug(`Emitter._buildTree(): adding ${docletDebugInfo(interfaceMerge.doclet)} to ${docletDebugInfo(parent.doclet)}`);
                            parent.children.push(interfaceMerge);
                        }

                        debug(`Emitter._buildTree(): adding ${docletDebugInfo(obj.doclet)} to ${docletDebugInfo(parent.doclet)}`);
                        parent.children.push(obj);
                    }
                }
            }
            else
            {
                if (interfaceMerge)
                {
                    debug(`Emitter._buildTree(): ${docletDebugInfo(interfaceMerge.doclet)} detected as a root`);
                    this._treeRoots.push(interfaceMerge);
                }

                debug(`Emitter._buildTree(): ${docletDebugInfo(obj.doclet)} detected as a root`);
                this._treeRoots.push(obj);
            }
        }
    }

    private _parseTree()
    {
        debug(`----------------------------------------------------------------`);
        debug(`Emitter._parseTree()`);

        for (let i = 0; i < this._treeRoots.length; ++i)
        {
            const node = this._parseTreeNode(this._treeRoots[i]);

            if (node)
                this.results.push(node);
        }
    }

    private _parseTreeNode(node: IDocletTreeNode, parent?: IDocletTreeNode): ts.Node | null
    {
        debug(`Emitter._parseTreeNode(${docletDebugInfo(node.doclet)}, parent=${parent ? docletDebugInfo(parent.doclet) : parent})`);

        const children: ts.Node[] = [];

        if (children)
        {
            for (let i = 0; i < node.children.length; ++i)
            {
                const childNode = this._parseTreeNode(node.children[i], node);

                if (childNode)
                    children.push(childNode);
            }
        }

        switch (node.doclet.kind)
        {
            case 'class':
                if (isConstructor(node.doclet))
                {
                    // constructor in es6 classes with own doclet
                    return createConstructor(node.doclet);
                }
                else
                {
                    return createClass(node.doclet, children);
                }

            case 'constant':
            case 'member':
                if (isExportDefault(node.doclet))
                {
                    return createExportDefault(node.doclet);
                }
                else
                {
                    if (node.doclet.isEnum)
                        return createEnum(node.doclet);
                    else if (parent && parent.doclet.kind === 'class')
                        return createClassMember(node.doclet);
                    else if (parent && parent.doclet.kind === 'interface')
                        return createInterfaceMember(node.doclet);
                    else
                        return createNamespaceMember(node.doclet);
                }

            case 'callback':
            case 'function':
                if (node.doclet.memberof)
                {
                    const parent = this._treeNodes[node.doclet.memberof];

                    if (parent && parent.doclet.kind === 'class')
                        return createClassMethod(node.doclet);
                    else if (parent && parent.doclet.kind === 'interface')
                        return createInterfaceMethod(node.doclet);
                }
                return createFunction(node.doclet);

            case 'interface':
                return createInterface(node.doclet, children);

            case 'mixin':
                return createInterface(node.doclet, children);

            case 'module':
                return createModule(node.doclet, !!node.isNested, children);

            case 'namespace':
                return createNamespace(node.doclet, !!node.isNested, children);

            case 'typedef':
                return createTypedef(node.doclet, children);

            case 'file':
                return null;

            case 'event':
                // TODO: Handle Events.
                return null;

            default:
                return assertNever(node.doclet);
        }
    }

    private _ignoreDoclet(doclet: TAnyDoclet): boolean
    {
        let reason: string|undefined = undefined;
        if (doclet.kind === 'package')
            reason = 'package doclet';
        else if (!!doclet.ignore)
            reason = 'doclet with an ignore flag';
        else if (!this.options.private && doclet.access === 'private')
            reason = 'private access disabled';
        if (reason
            || (doclet.kind === 'package')) // <= hack for typescript resolutions
        {
            debug(`Emitter._ignoreDoclet(doclet=${docletDebugInfo(doclet)}) => true (${reason})`);
            return true
        }

        if (doclet.access === undefined) {
            return false
        }

        const accessLevels = ["private", "package", "protected", "public"];
        const ignored = accessLevels.indexOf(doclet.access.toString()) < accessLevels.indexOf(this.options.access || "package");
        if (ignored) {
            debug(`Emitter._ignoreDoclet(doclet=${docletDebugInfo(doclet)}) => true (low access level)`);
        }
        return ignored;
    }

    private _getInterfaceKey(longname?: string): string
    {
        debug(`Emitter._getInterfaceKey('${longname}')`);

        return longname ? longname + '$$interface$helper' : '';
    }

    private _getNamespaceKey(longname?: string): string
    {
        debug(`Emitter._getNamespaceKey('${longname}')`);

        return longname ? longname + '$$namespace$helper' : '';
    }

    private _getOrCreateClassNamespace(obj: IDocletTreeNode): IDocletTreeNode
    {
        debug(`Emitter._getOrCreateClassNamespace(${docletDebugInfo(obj.doclet)})`);

        if (obj.doclet.kind === 'namespace')
            return obj;

        const namespaceKey = this._getNamespaceKey(obj.doclet.longname);
        let mod = this._treeNodes[namespaceKey];

        if (mod)
            return mod;

        mod = this._treeNodes[namespaceKey] = {
            doclet: {
                kind: 'namespace',
                name: obj.doclet.name,
                scope: 'static',
                longname: namespaceKey,
            },
            children: [],
        };

        if (obj.doclet.memberof)
        {
            const parent = this._treeNodes[obj.doclet.memberof];

            if (!parent)
            {
                warn(`Failed to find parent of doclet '${obj.doclet.longname}' using memberof '${obj.doclet.memberof}', this is likely due to invalid JSDoc.`, obj.doclet);
                return mod;
            }

            let parentMod = this._getOrCreateClassNamespace(parent);

            mod.doclet.memberof = parentMod.doclet.longname;
            parentMod.children.push(mod);
        }
        else
        {
            this._treeRoots.push(mod);
        }

        return mod;
    }
}
