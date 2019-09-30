import * as fs from 'fs';
import * as path from 'path';
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
import { generateTree, StringTreeNode, resolveTypeParameters } from './type_resolve_helpers';

interface IDocletTreeNode
{
    doclet: TDoclet;
    children: IDocletTreeNode[];
    isNested?: boolean;
    /**
     * Helper flag for named export identification.
     */
    isNamedExport?: boolean;
    /**
     * Flag set by the 'exported' generation strategy when Emitter._markExported() is called.
     */
    isExported?: boolean;
    /**
     * Makes the node be exported with another name for export.
     * Prevails on `@ignore` tags when set.
     */
    exportName?: string;
}

function isDocumented(doclet: TDoclet): boolean
{
    // Same predicate as in publish().
    if (doclet.undocumented)
        if (doclet.comment && (doclet.comment.length > 0))
            return true;
        else
            return false;
    else
        return true;
}

function isClassLike(doclet: TDoclet): boolean
{
    return doclet.kind === 'class' || doclet.kind === 'interface' || doclet.kind === 'mixin';
}

function isModuleLike(doclet: TDoclet): boolean
{
    return doclet.kind === 'module' || doclet.kind === 'namespace';
}

function isEnum(doclet: TDoclet): boolean
{
    return !!(
        (doclet.kind === 'member' || doclet.kind === 'constant')
        && doclet.isEnum
    );
}

function isDefaultExport(doclet: TDoclet, treeNodes: Dictionary<IDocletTreeNode>): boolean
{
    if ((doclet.kind !== 'module')
        && doclet.meta && (doclet.meta.code.name === 'module.exports')
        && doclet.longname.startsWith('module:'))
    {
        // Jsdoc does not set the memberof attribute for default exports (we shall fix that actually).
        // By default, the longname of the default export doclet is the longname of the member module.
        const moduleName = doclet.memberof ? doclet.memberof : doclet.longname;
        // Let's check the longname corresponds to an existing module in the current tree nodes.
        const node = treeNodes[moduleName];
        if (node && (node.doclet.kind === 'module'))
        {
            // This is a default export doclet.

            // Let's fix a couple of missing things (if not already fixed) at this point.
            if (! doclet.memberof)
            {
                doclet.memberof = node.doclet.longname;
                debug(`isDefaultExport(): ${docletDebugInfo(doclet)}.memberof fixed to '${doclet.memberof}'`);
            }

            if (! doclet.meta.code.value)
            {
                // When the default export value is not given in the `meta.code.value` attribute,
                // let's read it directly from the source file.
                const sourcePath : string = path.join(doclet.meta.path, doclet.meta.filename);
                const fd = fs.openSync(sourcePath, 'r');
                if (fd < 0)
                {
                    warn(`Could not read from '${sourcePath}'`);
                    return true;
                }
                const begin = doclet.meta.range[0];
                const end = doclet.meta.range[1];
                const length = end - begin;
                const buffer = Buffer.alloc(length);
                if (fs.readSync(fd, buffer, 0, length, begin) !== length)
                {
                    warn(`Could not read from '${sourcePath}'`);
                    return true;
                }
                doclet.meta.code.value = buffer.toString().trim();
                if (doclet.meta.code.value.endsWith(";"))
                    doclet.meta.code.value = doclet.meta.code.value.slice(0, -1).trimRight();
                if (doclet.meta.code.value.match(/^export +default +/))
                    doclet.meta.code.value = doclet.meta.code.value.replace(/^export +default +/, "");
                debug(`isDefaultExport(): ${docletDebugInfo(doclet)}.meta.code.value fixed to '${doclet.meta.code.value}'`);
            }

            return true;
        }
    }
    return false;
}

function isNamedExport(doclet: TDoclet, treeNodes: Dictionary<IDocletTreeNode>): boolean
{
    // First of all, check whether the `.isNamedExport` flag is set.
    const node = treeNodes[doclet.longname];
    if (node && node.isNamedExport)
    {
        return true;
    }

    // Otherwise, analyze the doclet info.
    if ((doclet.kind !== 'module')
        && doclet.meta && doclet.meta.code.name
        && (doclet.meta.code.name.startsWith('module.exports.') || doclet.meta.code.name.startsWith('exports.'))
        && doclet.longname.startsWith('module:')
        && doclet.memberof) // <= memberof is set by jsdoc for named exports.
    {
        // Let's check the parent node is a module.
        const parent = treeNodes[doclet.memberof];
        if (parent && (parent.doclet.kind === 'module'))
        {
            // Set the `.isNamedExport` attribute by the way.
            // This ensures the doclet will still be recognized as a named export, even though its name is changed (in create_helpers.ts possibly).
            if (node)
            {
                node.isNamedExport = true;
            }

            return true;
        }
    }
    return false;
}

/**
 * Determines whether the given doclet is a 'exports =' assignment.
 * In that case, the doclet longname takes the module's one,
 * disturbing by the way the processing of the doclets.
 */
function isExportsAssignment(doclet: TDoclet, treeNodes: Dictionary<IDocletTreeNode>): boolean
{
    if ((doclet.kind === 'member')
        && doclet.meta && doclet.meta.code.name && (doclet.meta.code.name === 'exports')
        && doclet.longname.startsWith('module:')
        && doclet.memberof) // <= memberof is set by jsdoc for named exports.
    {
        // Let's check the memberof node is a module.
        const node = treeNodes[doclet.memberof];
        if (node && (node.doclet.kind === 'module'))
            return true;
    }
    return false;
}

function shouldMoveOutOfClass(doclet: TDoclet): boolean
{
    return isClassLike(doclet)
        || isModuleLike(doclet)
        || isEnum(doclet)
        || doclet.kind === 'typedef';
}

function isClassDeclaration(doclet: TDoclet): boolean
{
    return !!(
        doclet && (doclet.kind === 'class')
        && doclet.meta && (
            // When the owner class's comment contains a `@class` tag, the first doclet for the class is a detached one,
            // by the way the `meta.code` section is empty.
            (! doclet.meta.code.type)
            || (doclet.meta.code.type === 'ClassDeclaration')
            || (doclet.meta.code.type === 'ClassExpression')
        )
    );
}

function isConstructor(doclet: TDoclet): boolean
{
    return !!(
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
        if (this.options.generationStrategy === 'exported')
            this._markExported();
        this._parseTree();
    }

    emit()
    {
        debug(`----------------------------------------------------------------`);
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

            if (doclet.kind === 'package'
                // Do not ignore doclet at this stage.
                // Let's create the tree node, build the tree,
                // and eventually filter out the node when generating the output in _parseTreeNode().
                //|| this._ignoreDoclet(doclet)
                )
            {
                debug(`Emitter._createTreeNodes(): skipping ${docletDebugInfo(doclet)} (package)`);
                continue;
            }

            const node = this._treeNodes[doclet.longname];
            if (!node)
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

            if (doclet.kind === 'package'
                // Do not ignore doclet at this stage.
                // Let's build the tree,
                // and eventually filter out the node when generating the output in _parseTreeNode().
                //|| this._ignoreDoclet(doclet)
                )
            {
                debug(`Emitter._buildTree(): skipping ${docletDebugInfo(doclet)} (package)`);
                continue nextDoclet;
            }

            if (isConstructor(doclet))
            {
                // If this doclet is a constructor, do not watch the 'memberof' attribute:
                // - it usually has the same value as the owner class's declaration,
                // - it does not point to the owner class itself.
                // Use the 'longname' which equals to the owner class's 'longname'.
                const ownerClass = this._getNodeFromLongname(doclet.longname, (node: IDocletTreeNode) => isClassDeclaration(node.doclet));
                if (!ownerClass)
                {
                    warn(`Failed to find owner class of constructor '${doclet.longname}'.`, doclet);
                    continue nextDoclet;
                }
                // jsdoc@3.6.3 may generate multiple doclets for constructors.
                // Watch in the class children whether a constructor is already registered.
                if (this._checkDuplicateChild(doclet, ownerClass, (child: IDocletTreeNode) => isConstructor(child.doclet)))
                    continue nextDoclet;

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
                    const longname = this._getInterfaceKey(doclet.longname);
                    interfaceMerge = this._treeNodes[longname] = {
                        doclet: {
                            kind: 'interface',
                            name: doclet.name,
                            scope: doclet.scope,
                            longname: longname,
                            augments: extras,
                            memberof: doclet.memberof,
                        },
                        children: [],
                    };
                    debug(`Emitter._buildTree(): merge interface ${docletDebugInfo(interfaceMerge.doclet)} created for ${docletDebugInfo(doclet)}`);
                }
            }

            let namespaceMerge: IDocletTreeNode | null = null;

            // Generate an namespace of the same name as the interface/mixin to perform
            // a namespace merge containing any static children (ex members and functions).
            if (doclet.kind === 'interface' || doclet.kind === 'mixin')
            {
                const staticChildren = docs.filter(d => (d as IDocletBase).memberof === doclet.longname && (d as IDocletBase).scope === 'static');
                if (staticChildren.length)
                {
                    const longname = this._getNamespaceKey(doclet.longname);
                    namespaceMerge = this._treeNodes[longname] = {
                        doclet: {
                            kind: 'namespace',
                            name: doclet.name,
                            scope: doclet.scope,
                            longname: longname,
                            memberof: doclet.memberof,
                        },
                        children: [],
                    };
                    debug(`Emitter._buildTree(): merge namespace ${docletDebugInfo(namespaceMerge.doclet)} created for ${docletDebugInfo(doclet)}`);

                    staticChildren.forEach(c => (c as IDocletBase).memberof = longname);
                }
            }

            // Call isDefaultExport() a first time here, in order to fix the `.memberof` attribute if not set.
            isDefaultExport(doclet, this._treeNodes);

            if (doclet.memberof)
            {
                const parent = this._getNodeFromLongname(doclet.memberof, function(node: IDocletTreeNode) {
                    // When the scope of the doclet is 'instance', look for something that is a class or so.
                    if (doclet.scope === 'instance')
                        return isClassLike(node.doclet);
                    return true;
                });
                if (!parent)
                {
                    warn(`Failed to find parent of doclet '${doclet.longname}' using memberof '${doclet.memberof}', this is likely due to invalid JSDoc.`, doclet);
                    continue nextDoclet;
                }

                if (isDefaultExport(doclet, this._treeNodes))
                {
                    if (doclet.meta && doclet.meta.code.value && doclet.meta.code.value.startsWith('{'))
                    {
                        // 'module.exports = {name: ... }' named export pattern.
                        debug(`Emitter._buildTree(): 'module.exports = {name: ... }' named export pattern doclet ${docletDebugInfo(doclet)}: skipping doclet but scan the object members`);
                        // This default export doclet is followed by doclets wich describe each field of the {name: ...} object,
                        // but those are not named 'export' and thus cannot be detected as named exports by default.
                        const value = JSON.parse(doclet.meta.code.value);
                        for (const name in value)
                        {
                            this._resolveDocletType(name, parent,
                                function(namedExportNode: IDocletTreeNode) {
                                    debug(`Emitter._buildTree(): tagging ${docletDebugInfo(namedExportNode.doclet)} as a named export`);
                                    namedExportNode.isNamedExport = true;
                                }
                            );
                        }
                        continue nextDoclet;
                    }
                    else
                    {
                        // Export doclets may be twiced, escpecially in case of inline or lambda definitions.
                        // Scan the parent module's children in order to avoid the addition of two doclets for the same default export purpose.
                        const thisEmitter = this;
                        if (this._checkDuplicateChild(doclet, parent, (child: IDocletTreeNode) => isDefaultExport(child.doclet, thisEmitter._treeNodes)))
                            continue nextDoclet;
                        // No default export doclet yet in the parent module.
                        debug(`Emitter._buildTree(): adding default export ${docletDebugInfo(doclet)} to module ${docletDebugInfo(parent.doclet)}`);
                        // The longname of default export doclets is the same as the one of the parent module itself.
                        // Thus no tree node has been created yet. Let's create one.
                        parent.children.push({ doclet: doclet, children: [] });
                        continue nextDoclet;
                    }
                }
                if (isExportsAssignment(doclet, this._treeNodes))
                {
                    debug(`Emitter._buildTree(): adding 'exports =' assignment ${docletDebugInfo(doclet)} to module ${docletDebugInfo(parent.doclet)}`);
                    // The longname of 'exports =' assignment doclets is the same as the one of the parent module itself.
                    // Thus no tree node has been created yet. Let's create one.
                    parent.children.push({ doclet: doclet, children: [] });
                    continue nextDoclet;
                }

                const obj = this._treeNodes[doclet.longname];
                if (!obj)
                {
                    warn('Failed to find doclet node when building tree, this is likely a bug.', doclet);
                    continue nextDoclet;
                }

                const isParentClassLike = isClassLike(parent.doclet);

                // We need to move this into a module of the same name as the parent
                if (isParentClassLike && shouldMoveOutOfClass(doclet))
                {
                    debug(`Emitter._buildTree(): move out of class!`);

                    const mod = this._getOrCreateClassNamespace(parent);

                    if (interfaceMerge)
                    {
                        debug(`Emitter._buildTree(): adding ${docletDebugInfo(interfaceMerge.doclet)} to ${docletDebugInfo(mod.doclet)}`);
                        mod.children.push(interfaceMerge);
                    }
                    if (namespaceMerge)
                    {
                        debug(`Emitter._buildTree(): adding ${docletDebugInfo(namespaceMerge.doclet)} to ${docletDebugInfo(mod.doclet)}`);
                        mod.children.push(namespaceMerge);
                    }

                    debug(`Emitter._buildTree(): adding ${docletDebugInfo(obj.doclet)} to ${docletDebugInfo(mod.doclet)}`);
                    mod.children.push(obj);
                }
                else
                {
                    if (this._checkDuplicateChild(doclet, parent,
                        function(child: IDocletTreeNode) {
                            if (child.doclet.kind !== doclet.kind)
                                return false;
                            if (child.doclet.longname === doclet.longname)
                                return true;
                            // Check also against the optional form of the doclet.
                            const shortname = doclet.name || '';
                            const optionalLongname = doclet.longname.slice(0, doclet.longname.length - shortname.length) + `[${shortname}]`;
                            if (child.doclet.longname === optionalLongname)
                                return true;
                            return false;
                        }
                    ))
                        continue nextDoclet;

                    const isObjModuleLike = isModuleLike(doclet);
                    const isParentModuleLike = isModuleLike(parent.doclet);

                    if (isObjModuleLike && isParentModuleLike)
                    {
                        debug(`Emitter._buildTree(): nested modules / namespaces!`);
                        obj.isNested = true;
                    }

                    const isParentEnum = isEnum(parent.doclet);

                    if (!isParentEnum)
                    {
                        if (interfaceMerge)
                        {
                            debug(`Emitter._buildTree(): adding ${docletDebugInfo(interfaceMerge.doclet)} to ${docletDebugInfo(parent.doclet)}`);
                            parent.children.push(interfaceMerge);
                        }

                        if (namespaceMerge)
                        {
                            debug(`Emitter._buildTree(): adding ${docletDebugInfo(namespaceMerge.doclet)} to ${docletDebugInfo(parent.doclet)}`);
                            parent.children.push(namespaceMerge);
                        }

                        debug(`Emitter._buildTree(): adding ${docletDebugInfo(obj.doclet)} to ${docletDebugInfo(parent.doclet)}`);
                        parent.children.push(obj);
                    }
                }
            }
            else
            {
                const obj = this._treeNodes[doclet.longname];
                if (!obj)
                {
                    warn('Failed to find doclet node when building tree, this is likely a bug.', doclet);
                    continue nextDoclet;
                }

                if (interfaceMerge)
                {
                    debug(`Emitter._buildTree(): ${docletDebugInfo(interfaceMerge.doclet)} detected as a root`);
                    this._treeRoots.push(interfaceMerge);
                }

                if (namespaceMerge)
                {
                    debug(`Emitter._buildTree(): ${docletDebugInfo(namespaceMerge.doclet)} detected as a root`);
                    this._treeRoots.push(namespaceMerge);
                }

                debug(`Emitter._buildTree(): ${docletDebugInfo(obj.doclet)} detected as a root`);
                this._treeRoots.push(obj);
            }
        }
    }

    /**
     * Before adding the doclet as a child of a candidate parent, check whether it is a duplicate a an already known child.
     * In such a case, the most documented doclet is preferred, or the last one.
     * @param doclet Candidate child doclet.
     * @param parent Candidate parent node.
     * @param match Handler that tells whether an already known child is a duplicate for the previous candidate child `doclet`.
     * @returns `true` when a duplicate has been found, `false` otherwise.
     */
    private _checkDuplicateChild(doclet: TDoclet, parent: IDocletTreeNode, match: (child: IDocletTreeNode) => boolean): boolean
    {
        // Check this doclet does not exist yet in the candidate parent's children.
        for (const child of parent.children)
        {
            if (match(child))
            {
                if (! isDocumented(doclet))
                {
                    // Do not add the undocumented doclet to the parent twice.
                    debug(`Emitter._checkConcurrentChild(): skipping undocumented ${docletDebugInfo(doclet)} because ${docletDebugInfo(child.doclet)} is already known in parent ${docletDebugInfo(parent.doclet)}`);

                    // At this point, we could be tempted to merge meta information between detached and actual doclets.
                    // The code below has no particular use in the rest of the process, thus it is not activated yet,
                    // but it could be of interest, so it is left as a comment:
                    /*// Check whether the meta information can be merged between a detached and an actual doclet.
                    if (doclet.meta && doclet.meta.range                            // <= is `doclet` an actual doclet?
                        && ((! child.doclet.meta) || (! child.doclet.meta.range)))  // <= is `child.doclet` a detached doclet?
                    {
                        debug(`Emitter._buildTree(): replacing ${docletDebugInfo(child.doclet)}'s meta info with ${docletDebugInfo(doclet)}'s one`);
                        child.doclet.meta = doclet.meta;
                        debug(`Emitter._buildTree(): => is now ${docletDebugInfo(child.doclet)}`);
                    }*/
                }
                else
                {
                    // Replace the previously known doclet by this new one in other cases.
                    debug(`Emitter._buildTree(): replacing ${docletDebugInfo(child.doclet)} with ${docletDebugInfo(doclet)} in ${docletDebugInfo(parent.doclet)}`);
                    child.doclet = doclet;
                }

                return true;
            }
        }
        return false;
    }

    private _markExported()
    {
        debug(`----------------------------------------------------------------`);
        debug(`Emitter._markExported()`);

        // Ensure `_markExportedNode()` can be used as a callback function with the appropriate `this` context.
        this._markExportedNode = this._markExportedNode.bind(this);

        // Scan the tree root nodes, identify the 'module' ones,
        // and launch the recursive _markExportedNode() function on them.
        for (let i = 0; i < this._treeRoots.length; i++)
        {
            const node = this._treeRoots[i];
            if (node.doclet.kind === 'module')
                this._markExportedNode(node);
        }
    }

    private _markExportedNode(node: IDocletTreeNode, markThisNode: boolean = true)
    {
        debug(`Emitter._markExportedNode(${docletDebugInfo(node.doclet)}, markThisNode=${markThisNode})`);

        // First of all, mark the node with the 'isExported' flag.
        const doProcessNode = (node.isExported === undefined);
        if (markThisNode)
            node.isExported = true;
        else if (! node.isExported)
            node.isExported = false;

        // Process the node once only in order to avoid infinite loops in cas of cyclic dependencies.
        if (! doProcessNode)
            return;

        // Then, for each kind of node, iterate over the related nodes.
        switch (node.doclet.kind)
        {
            // IClassDoclet:
            case 'class':
            case 'interface':
            case 'mixin':
                this._markExportedParams(node, node.doclet.params);
                if (node.doclet.augments)
                    for (const augment of node.doclet.augments)
                        this._resolveDocletType(augment, node, this._markExportedNode);
                if (node.doclet.implements)
                    for (const implement of node.doclet.implements)
                        this._resolveDocletType(implement, node, this._markExportedNode);
                if (node.doclet.mixes)
                    for (const mix of node.doclet.mixes)
                        this._resolveDocletType(mix, node, this._markExportedNode);
                this._markExportedChildren(node);
                break;

            // IFileDoclet:
            case 'file':
                this._markExportedParams(node, node.doclet.params);
                break;

            // IEventDoclet:
            case 'event':
                this._markExportedParams(node, node.doclet.params);
                break;

            // IFunctionDoclet:
            case 'callback':
            case 'function':
                if (node.doclet.this)
                    this._resolveDocletType(node.doclet.this, node, this._markExportedNode);
                this._markExportedParams(node, node.doclet.params);
                this._markExportedReturns(node, node.doclet.returns);
                break;

            // IMemberDoclet:
            case 'member':
            case 'constant':
                if (isDefaultExport(node.doclet, this._treeNodes))
                {
                    if (node.doclet.meta && node.doclet.meta.code.value)
                    {
                        this._resolveDocletType(node.doclet.meta.code.value, node, this._markExportedNode);
                    }
                }
                else if (isNamedExport(node.doclet, this._treeNodes)
                         && node.doclet.meta && node.doclet.meta.code.value
                         && (! isEnum(node.doclet)))
                {
                    const thisEmitter = this;
                    this._resolveDocletType(node.doclet.meta.code.value, node, function (refNode: IDocletTreeNode) {
                            // Directly mark the referenced node for export (through this path at least), only if the exported name is changed.
                            const markThisNode = node.doclet.meta && (node.doclet.meta.code.value === node.doclet.name);
                            thisEmitter._markExportedNode(refNode, markThisNode);
                        },
                        // Doclet filter: avoid cyclic loops in case this named export references a type with the same name.
                        function(target: IDocletTreeNode) {
                            return (target !== node);
                        }
                    );
                }
                else
                {
                    this._markExportedTypes(node, node.doclet.type);
                }
                break;

            // INamespaceDoclet:
            case 'module':
                // Search for export doclets in the module.
                for (const child of node.children)
                {
                    if (isDefaultExport(child.doclet, this._treeNodes)
                        || isNamedExport(child.doclet, this._treeNodes))
                    {
                        this._markExportedNode(child);
                    }
                }
                break;
            case 'namespace':
                this._markExportedChildren(node);
                break;

            // ITypedefDoclet:
            case 'typedef':
                this._markExportedTypes(node, node.doclet.type);
                // When the typedef is for a function, the doclet may have params and returns.
                this._markExportedParams(node, node.doclet.params);
                this._markExportedReturns(node, node.doclet.returns);
                break;

            default:
                return assertNever(node.doclet);
        }
    }

    private _markExportedTypes(node: IDocletTreeNode, types?: IDocletType)
    {
        if (types)
            for (const typeName of types.names)
                this._resolveDocletType(typeName, node, this._markExportedNode);
    }

    private _markExportedParams(node: IDocletTreeNode, params?: IDocletProp[])
    {
        if (params)
            for (const param of params)
                if (param.type)
                    for (const paramType of param.type.names)
                        this._resolveDocletType(paramType, node, this._markExportedNode);
    }

    private _markExportedReturns(node: IDocletTreeNode, returns?: IDocletReturn[])
    {
        if (returns)
            for (const ret of returns)
                for (const retType of ret.type.names)
                    this._resolveDocletType(retType, node, this._markExportedNode);
    }

    private _markExportedChildren(node: IDocletTreeNode)
    {
        for (const child of node.children)
            this._markExportedNode(child);
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
        if ((this.options.generationStrategy === 'exported') && (! node.isExported))
        {
            debug(`Emitter._parseTreeNode(${docletDebugInfo(node.doclet)}): skipping doclet, not exported`);
            return null;
        }
        if ((! node.exportName) // Check the `.exportName` flag before calling `_ignoreDoclet()` in order to avoid false debug lines.
            && this._ignoreDoclet(node.doclet))
        {
            debug(`Emitter._parseTreeNode(${docletDebugInfo(node.doclet)}): skipping ignored doclet`);
            return null;
        }

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
                    return createClass(node.doclet, children, node.exportName);
                }

            case 'constant':
            case 'member':
                if (isDefaultExport(node.doclet, this._treeNodes)
                    && (node.doclet.meta && node.doclet.meta.code.value))
                {
                    return createExportDefault(node.doclet, node.doclet.meta.code.value);
                }
                if (isNamedExport(node.doclet, this._treeNodes)
                    && node.doclet.meta && node.doclet.meta.code.value
                    && (! isEnum(node.doclet)))
                {
                    if (node.doclet.meta.code.value !== node.doclet.name)
                    {
                        const thisEmitter = this;
                        let tsRes: ts.Node | null = null;
                        this._resolveDocletType(node.doclet.meta.code.value, node, function(refNode: IDocletTreeNode) {
                            // Named export from a type with a different name.
                            // Create a live IDocletTreeNode object with the `.exportName` attribute set.
                            const namedRefNode: IDocletTreeNode = {
                                doclet: refNode.doclet,
                                children: refNode.children,
                                isNested: refNode.isNested,
                                isExported: true,
                                exportName: node.doclet.name
                            }
                            tsRes = thisEmitter._parseTreeNode(namedRefNode, parent);
                        });
                        return tsRes;
                    }
                    else
                    {
                        // Nothing to do.
                        debug(`Emitter._parseTreeNode(): skipping named export with reference of the same name`);
                        return null;
                    }
                }
                if (isExportsAssignment(node.doclet, this._treeNodes))
                {
                    // Nothing to do.
                    debug(`Emitter._parseTreeNode(): skipping 'exports =' assignment`);
                    return null;
                }

                if (node.doclet.isEnum)
                    return createEnum(node.doclet, node.exportName);
                else if (parent && parent.doclet.kind === 'class')
                    return createClassMember(node.doclet);
                else if (parent && parent.doclet.kind === 'interface')
                    return createInterfaceMember(node.doclet);
                else
                    // For both namespace and module members. `node.exportName` may be set.
                    return createNamespaceMember(node.doclet, node.exportName);

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
                return createFunction(node.doclet, node.exportName);

            case 'interface':
                return createInterface(node.doclet, children, node.exportName);

            case 'mixin':
                return createInterface(node.doclet, children, node.exportName);

            case 'module':
                return createModule(node.doclet, !!node.isNested, children);

            case 'namespace':
                return createNamespace(node.doclet, !!node.isNested, children, node.exportName);

            case 'typedef':
                return createTypedef(node.doclet, children, node.exportName);

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
        // Constructors should be generated with their documentation whatever their access level.
        if ((doclet.kind !== 'package') && isConstructor(doclet))
        {
            return false;
        }

        let reason: string|undefined = undefined;
        if (doclet.kind === 'package')
            reason = 'package doclet';
        else if (!!doclet.ignore)
            reason = 'doclet with an ignore flag';
        else if (!this.options.private && doclet.access === 'private')
            reason = 'private access disabled';
        // Disable method overrides. See [tsd-jsdoc#104](https://github.com/englercj/tsd-jsdoc/issues/104).
        else if ((doclet.kind === 'function') && (doclet.override || doclet.overrides))
            reason = 'overriding doclet';
        if (reason
            || (doclet.kind === 'package')) // <= hack for typescript resolutions
        {
            debug(`Emitter._ignoreDoclet(doclet=${docletDebugInfo(doclet)}) => true (${reason})`);
            return true
        }

        if (doclet.access === undefined)
        {
            return false
        }

        const accessLevels = ["private", "package", "protected", "public"];
        const ignored = accessLevels.indexOf(doclet.access.toString()) < accessLevels.indexOf(this.options.access || "package");
        if (ignored)
        {
            debug(`Emitter._ignoreDoclet(doclet=${docletDebugInfo(doclet)}) => true (low access level)`);
        }
        return ignored;
    }

    private _getInterfaceKey(longname?: string): string
    {
        return longname ? longname + '$$interface$helper' : '';
    }

    private _getNamespaceKey(longname?: string): string
    {
        return longname ? longname + '$$namespace$helper' : '';
    }

    private _getOrCreateClassNamespace(obj: IDocletTreeNode): IDocletTreeNode
    {
        function _debug(msg: string) { /*debug(msg);*/ }
        _debug(`Emitter._getOrCreateClassNamespace(${docletDebugInfo(obj.doclet)})`);

        if ((obj.doclet.kind === 'module') || (obj.doclet.kind === 'namespace'))
        {
            _debug(`Emitter._getOrCreateClassNamespace(): ${docletDebugInfo(obj.doclet)} is a module or namespace`)
            return obj;
        }

        const namespaceKey = this._getNamespaceKey(obj.doclet.longname);
        let mod = this._treeNodes[namespaceKey];

        if (mod)
        {
            _debug(`Emitter._getOrCreateClassNamespace(): longname '${obj.doclet.longname}' already exists in this._treeNodes`);
            return mod;
        }

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
            _debug(`Emitter._getOrCreateClassNamespace(): memberof='${obj.doclet.memberof}'`);
            const parent = this._treeNodes[obj.doclet.memberof];

            if (!parent)
            {
                warn(`Failed to find parent of doclet '${obj.doclet.longname}' using memberof '${obj.doclet.memberof}', this is likely due to invalid JSDoc.`, obj.doclet);
                return mod;
            }

            let parentMod = this._getOrCreateClassNamespace(parent);

            debug(`Emitter._getOrCreateClassNamespace(): pushing ${docletDebugInfo(mod.doclet)} as a child of ${docletDebugInfo(parentMod.doclet)}`);
            mod.doclet.memberof = parentMod.doclet.longname;
            parentMod.children.push(mod);
        }
        else
        {
            debug(`Emitter._getOrCreateClassNamespace(): no memberof, pushing ${docletDebugInfo(mod.doclet)} as a root`);
            this._treeRoots.push(mod);
        }

        return mod;
    }

    /**
     * Search for a IDocletTreeNode from its longname.
     * Handles situations where default exported lambda types hold the same longname as the parent module.
     * @param longname  Longname to search for.
     * @param filter    Optional filter function that indicates whether a doclet is an appropriate candidate for what we search.
     */
    private _getNodeFromLongname(longname: string, filter?: (node: IDocletTreeNode) => boolean): IDocletTreeNode | null
    {
        function _debug(msg: string) { /*debug(msg);*/ }

        const node = this._treeNodes[longname];
        if (!node)
        {
            _debug(`Emitter._getNodeFromLongname('${longname}') => null`);
            warn(`No such doclet '${longname}'`);
            return null;
        }

        if ((! filter) || filter(node))
        {
            _debug(`Emitter._getNodeFromLongname('${longname}') => ${docletDebugInfo(node.doclet)}`);
            return node;
        }

        if (node.doclet.kind === 'module')
        {
            // The searched item has the same longname as a mdoule.
            // This happens when the item is an inline or lambda class exported by default.
            // Look for the item in the module's children.
            for (const child of node.children)
            {
                if ((child.doclet.longname === longname) && filter(child))
                {
                    _debug(`Emitter._getNodeFromLongname('${longname}') => ${docletDebugInfo(child.doclet)}`);
                    return child;
                }
            }
            _debug(`Emitter._getNodeFromLongname('${longname}') => null`);
            warn(`No such doclet '${longname}' in module`);
            return null;
        }
        else
        {
            _debug(`Emitter._getNodeFromLongname('${longname}') => null`);
            warn(`Unexpected doclet for longname '${longname}`, node.doclet);
            return null;
        }
    }

    /**
     * From the context of `currentNode`, search for the doclets which type name corresponds to `typeName`, and apply `callback` on them.
     * @param currentNode   Starting context for type resolution.
     * @param typeName      Type name to search for.
     * @param callback      Callback to apply on each resolved doclet.
     * @param filter        Optional filter function that indicates whether a doclet is an appropriate candidate for what we search.
     */
    private _resolveDocletType(
        typeName: string, currentNode: IDocletTreeNode,
        callback: (node: IDocletTreeNode) => void,
        filter?: (node: IDocletTreeNode) => boolean): void
    {
        function _debug(msg: string) { /*debug(msg);*/ }
        _debug(`Emitter._resolveDocletType(typeName='${typeName}', currentNode=${docletDebugInfo(currentNode.doclet)})`);

        const tokens = generateTree(typeName);
        if (!tokens)
        {
            warn(`Could not resolve type '${typeName}' in current node:`, currentNode.doclet);
            return;
        }
        tokens.dump((msg: string) => _debug(`Emitter._resolveDocletType(): tokens = ${msg}`));

        const thisEmitter = this;
        tokens.walkTypes(function(token: StringTreeNode) {
            _debug(`Emitter._resolveDocletType(): token = {name:${token.name}, type:${token.typeToString()}}`);
            typeName = token.name;
            if (typeName.match(/.*\[ *\].*/))
                typeName = typeName.slice(0, typeName.indexOf('['));
            _debug(`Emitter._resolveDocletType(): typeName = ${typeName}`);

            // Skip basic types.
            switch (typeName)
            {
                case 'void':
                case 'null':
                case 'string': case 'String':
                case 'boolean': case 'Boolean':
                case 'number': case 'Number':
                case 'function': case 'Function':
                case 'any':
                case 'object': case 'Object': // <= means 'any' in jsdoc
                case '*': // <= means 'any' in jsdoc
                case 'Array':
                case 'Union':
                case 'Promise':
                case 'HTMLElement': // <= Basic typescript type.
                    return;
            }

            // Lookup for the target symbol through up the scopes.
            let scope: string | undefined = currentNode.doclet.longname;
            while (scope)
            {
                _debug(`Emitter._resolveDocletType(): scope='${scope}'`);
                const longnames = [
                    `${scope}.${typeName}`,
                    `${scope}~${typeName}`,
                    `${scope}~${typeName}$$interface$helper`,
                    `${scope}~${typeName}$$namespace$helper`,
                ];
                let targetFound = false;
                for (const longname of longnames)
                {
                    _debug(`Emitter._resolveDocletType(): trying longname '${longname}'...`);
                    const target = thisEmitter._treeNodes[longname];
                    if (target)
                    {
                        if (filter && (! filter(target)))
                        {
                            _debug(`Emitter._resolveDocletType(): filtered out ${docletDebugInfo(target.doclet)}`);
                        }
                        else
                        {
                            _debug(`Emitter._resolveDocletType(): found! ${docletDebugInfo(target.doclet)}`);
                            callback(target);
                            targetFound = true;
                        }
                    }
                }
                // When one target at least has been found within this scope, stop searching.
                if (targetFound)
                {
                    _debug(`Emitter._resolveDocletType(): done`);
                    return;
                }

                // Search for templates.
                // Does not work with jsdoc@3.6.3, as long as jsdoc@3.6.x does not support @template tags, nor generates "tags" sections anymore.
                const scopeNode: IDocletTreeNode | undefined = thisEmitter._treeNodes[scope];
                if (! scopeNode) break;
                for (const tsTypeParameterDeclaration of resolveTypeParameters(scopeNode.doclet))
                {
                    if (tsTypeParameterDeclaration.name.text === typeName)
                    {
                        _debug(`Emitter._resolveDocletType(): template found! in ${docletDebugInfo(scopeNode.doclet)}`);
                        // No doclet. Stop searching.
                        return;
                    }
                }

                scope = scopeNode.doclet.memberof;
            }

            warn(`Could not resolve type '${typeName}' in current node:`, currentNode.doclet);
        });
    }
}
