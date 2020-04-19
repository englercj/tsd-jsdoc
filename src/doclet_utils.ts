import * as fs from 'fs';
import * as path from 'path';
import { Dictionary } from './Dictionary';
import { IDocletTreeNode } from './Emitter';
import { warn, debug, docletDebugInfo } from './logger';


export function isDocumentedDoclet(doclet: TDoclet): boolean
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

export function isClassDoclet(doclet: TDoclet): doclet is IClassDoclet
{
    return doclet.kind === 'class' || doclet.kind === 'interface' || doclet.kind === 'mixin';
}

export function isFileDoclet(doclet: TDoclet): doclet is IFileDoclet
{
    return doclet.kind === 'file';
}

export function isEventDoclet(doclet: TDoclet): doclet is IEventDoclet
{
    return doclet.kind === 'event';
}

export function isFunctionDoclet(doclet: TDoclet): doclet is IFunctionDoclet
{
    return doclet.kind === 'function' || doclet.kind === 'callback';
}

export function isMemberDoclet(doclet: TDoclet): doclet is IMemberDoclet
{
    return doclet.kind === 'member' || doclet.kind === 'constant';
}

export function isNamespaceDoclet(doclet: TDoclet): doclet is INamespaceDoclet
{
    return doclet.kind === 'module' || doclet.kind === 'namespace';
}

export function isTypedefDoclet(doclet: TDoclet): doclet is ITypedefDoclet
{
    return doclet.kind === 'typedef';
}

export function isPackageDoclet(doclet: TAnyDoclet): doclet is IPackageDoclet
{
    return doclet.kind === 'package';
}

export function isEnumDoclet(doclet: TDoclet):
    //doclet is IMemberDoclet   <- Makes typescript believe `doclet` is of kind `IMemberDoclet`, even when the result is `false`
    boolean
{
    return isMemberDoclet(doclet) && (doclet.isEnum === true);
}

export function isDefaultExportDoclet(doclet: TDoclet, treeNodes: Dictionary<IDocletTreeNode>): boolean
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

export function isNamedExportDoclet(doclet: TDoclet, treeNodes: Dictionary<IDocletTreeNode>): boolean
{
    // First of all, check whether the `.isNamedExport` flag is already set.
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
export function isExportsAssignmentDoclet(doclet: TDoclet, treeNodes: Dictionary<IDocletTreeNode>):
    //doclet is IMemberDoclet   <- Makes typescript believe `doclet` is of kind `IMemberDoclet`, even when the result is `false`
    boolean
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
