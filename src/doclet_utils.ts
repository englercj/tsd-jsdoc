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

export function isEnumDoclet(doclet: TDoclet): doclet is IMemberDoclet
{
    return isMemberDoclet(doclet) && doclet.isEnum;
}
