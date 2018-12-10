import * as ts from 'typescript';
import { Dictionary } from './Dictionary';
import { warn } from './logger';
import { PropTree, IPropDesc } from './PropTree';
import { type } from 'os';

const rgxObjectTokenize = /(<|>|,)/;
const rgxCommaAll = /,/g;
const rgxParensAll = /\(|\)/g;

const anyTypeNode = ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
const strTypeNode = ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);

const anyGeneric: IGenericType = { kind: 'type', name: 'any', resolved: anyTypeNode };
const strGeneric: IGenericType = { kind: 'type', name: 'string', resolved: strTypeNode };

export function toKeywordTypeKind(k: string): ts.KeywordTypeNode['kind'] | null
{
    if (!k || k.length === 0)
        return null;

    k = k.toUpperCase();

    switch (k)
    {
        case 'ANY':         return ts.SyntaxKind.AnyKeyword;
        case 'UNKNOWN':     return ts.SyntaxKind.UnknownKeyword;
        case 'NUMBER':      return ts.SyntaxKind.NumberKeyword;
        case 'BIGINT':      return ts.SyntaxKind.BigIntKeyword;
        case 'OBJECT':      return ts.SyntaxKind.ObjectKeyword;
        case 'BOOLEAN':     return ts.SyntaxKind.BooleanKeyword;
        case 'BOOL':        return ts.SyntaxKind.BooleanKeyword; // alias
        case 'STRING':      return ts.SyntaxKind.StringKeyword;
        case 'SYMBOL':      return ts.SyntaxKind.SymbolKeyword;
        case 'THIS':        return ts.SyntaxKind.ThisKeyword;
        case 'VOID':        return ts.SyntaxKind.VoidKeyword;
        case 'UNDEFINED':   return ts.SyntaxKind.UndefinedKeyword;
        case 'NULL':        return ts.SyntaxKind.NullKeyword;
        case 'NEVER':       return ts.SyntaxKind.NeverKeyword;
        default:
            return null;
    }
}

export function resolveOptional(doclet: IDocletProp): ts.Token<ts.SyntaxKind.QuestionToken> | undefined
{
    if (doclet.defaultvalue || doclet.optional)
        return ts.createToken(ts.SyntaxKind.QuestionToken);

    return undefined;
}

export function resolveVariable(doclet: IDocletProp): ts.Token<ts.SyntaxKind.DotDotDotToken> | undefined
{
    if (doclet.variable)
        return ts.createToken(ts.SyntaxKind.DotDotDotToken);

    return undefined;
}

export function resolveTypeParameters(doclet: TDoclet): ts.TypeParameterDeclaration[]
{
    const typeParams: ts.TypeParameterDeclaration[] = [];

    if (doclet.tags)
    {
        for (let i = 0; i < doclet.tags.length; ++i)
        {
            const tag = doclet.tags[i];

            if (tag.title === 'template')
            {
                const types = (tag.text || 'T').split(',');

                for (let x = 0; x < types.length; ++x)
                {
                    const name = types[x].trim();

                    if (!name)
                        continue;

                    typeParams.push(ts.createTypeParameterDeclaration(
                        name,           // name
                        undefined,      // constraint
                        undefined       // defaultType
                    ));
                }
            }
        }
    }

    return typeParams;
}

export type TTypedDoclet = IMemberDoclet | ITypedefDoclet | IFunctionDoclet;

export function resolveType(t: IDocletType, doclet?: TTypedDoclet): ts.TypeNode
{
    if (!t || !t.names || t.names.length === 0)
    {
        if (doclet && doclet.properties)
            return resolveTypeName('object', doclet);

        const name = doclet ? doclet.longname || doclet.name : '"Unkown Name"';

        warn(`Unable to resolve type for ${name}, none specified in jsdoc. Defaulting to \`any\`.`, doclet);
        return anyTypeNode;
    }

    if (t.names.length === 1)
    {
        return resolveTypeName(t.names[0], doclet);
    }
    else
    {
        const types: ts.TypeNode[] = [];

        for (let i = 0; i < t.names.length; ++i)
        {
            types.push(resolveTypeName(t.names[i], doclet));
        }

        return ts.createUnionTypeNode(types);
    }
}

export function resolveTypeName(name: string, doclet?: TTypedDoclet): ts.TypeNode
{
    if (!name)
    {
        warn('Unable to resolve type name, it is null, undefined, or empty. Defaulting to \`any\`.', doclet);
        return anyTypeNode;
    }

    if (name === '*')
        return anyTypeNode;

    // Handle keyword and reference names
    const keyword = toKeywordTypeKind(name);

    if (keyword !== null)
    {
        if (keyword === ts.SyntaxKind.ThisKeyword)
            return ts.createThisTypeNode();

        if (keyword === ts.SyntaxKind.ObjectKeyword)
        {
            if (!doclet || !doclet.properties)
                return anyTypeNode;
            else
                return resolveTypeLiteral(doclet.properties);
        }

        return ts.createKeywordTypeNode(keyword);
    }

    const upperName = name.toUpperCase();

    if (upperName === 'FUNCTION' && doclet && doclet.kind === 'typedef')
    {
        const params = createFunctionParams(doclet);
        const type = createFunctionReturnType(doclet);

        return ts.createFunctionTypeNode(
            undefined,      // typeParameters
            params,         // parameters
            type            // type
        );
    }

    if (upperName.indexOf('.<') !== -1)
    {
        return resolveGenericType(name);
    }

    if (name.indexOf('|') !== -1)
    {
        const nameParts = name.split('|');
        const types: ts.TypeNode[] = [];

        for (let i = 0; i < nameParts.length; ++i)
        {
            const subName = nameParts[i].replace(rgxParensAll, '').trim();
            types.push(resolveTypeName(subName, doclet));
        }

        return ts.createUnionTypeNode(types);
    }

    return ts.createTypeReferenceNode(name, undefined);
}

interface IGenericBase
{
    name: string;
    parent?: IGenericContainer;
    resolved?: ts.TypeNode;
}

interface IGenericContainer extends IGenericBase
{
    kind: 'generic';
    types: TGeneric[];
}

interface IGenericType extends IGenericBase
{
    kind: 'type';
}

type TGeneric = (IGenericContainer | IGenericType);

export function resolveGenericType(name: string): ts.TypeNode
{
    const parts = name.split(rgxObjectTokenize);

    if (parts.length <= 1)
    {
        warn('Invalid object type encountered, this is likely due to invalid JSDoc. Defaulting to \`any\`.', name);
        return anyTypeNode;
    }

    let lastObj: TGeneric | null = null;
    let parentStack: IGenericContainer[] = [];

    // Build a tree representing the generic
    for (let i = 0; i < parts.length; ++i)
    {
        const partName = parts[i].trim();

        if (!partName || partName === ',')
            continue;

        if (partName.endsWith('.'))
        {
            const parent = parentStack[parentStack.length - 1];

            lastObj = {
                kind: 'generic',
                name: partName.substr(0, partName.length - 1),
                parent,
                types: [],
            };

            if (parent)
                parent.types.push(lastObj);
        }
        else if (partName === '<')
        {
            if (lastObj && lastObj.kind === 'generic')
                parentStack.push(lastObj);
        }
        else if (partName === '>')
        {
            parentStack.pop();
        }
        else
        {
            const parent = parentStack[parentStack.length - 1];

            if (!parent)
            {
                warn(`Invalid generic format encountered when parsing type: ${name}`);
                continue;
            }

            lastObj = {
                kind: 'type',
                name: partName,
                parent,
                resolved: resolveTypeName(partName),
            };

            parent.types.push(lastObj);
        }
    }

    if (!lastObj || !lastObj.parent)
    {
        warn('Unable to resolve Object/Array complex type. Defaulting to \`any\`.', name);
        return anyTypeNode;
    }

    return resolveGenericTypeTree(lastObj.parent);
}

function resolveGenericTypeTree(bottom: IGenericContainer)
{
    let lastType: ts.TypeNode | null = null;
    let parent: IGenericContainer | undefined = bottom;

    while (parent)
    {
        if (parent.kind === 'generic')
        {
            if (parent.name.toUpperCase() === 'OBJECT')
            {
                let keyType = parent.types[0];

                if (!keyType)
                {
                    warn(`Unable to resolve object key type, this is likely due to invalid JSDoc. Defaulting to \`string\`.`);
                    keyType = strGeneric;
                }
                else if (keyType.kind !== 'type'
                    || (keyType.name !== 'string' && keyType.name !== 'number'))
                {
                    warn(`Invalid object key type. It must be \`string\` or \`number\`, but got: ${keyType.name}. Defaulting to \`string\`.`);
                    keyType = strGeneric;
                }

                let valType = parent.types[1];

                if (!valType)
                {
                    warn('Unable to resolve object value type, this is likely due to invalid JSDoc. Defaulting to \`any\`.', parent);
                    valType = anyGeneric;
                }

                const indexParam = ts.createParameter(
                    undefined,          // decorators
                    undefined,          // modifiers
                    undefined,          // dotDotDotToken
                    'key',              // name
                    undefined,          // questionToken
                    keyType.resolved,   // type
                    undefined           // initializer
                );

                if (!valType.resolved)
                {
                    warn('Unable to resolve object value type, this is likely a bug. Defaulting to \`any\`.', parent);
                    valType.resolved = anyTypeNode;
                }

                const indexSignature = ts.createIndexSignature(
                    undefined,          // decorators
                    undefined,          // modifiers
                    [indexParam],       // parameters
                    valType.resolved,   // type
                );

                lastType = parent.resolved = ts.createTypeLiteralNode([indexSignature]);
            }
            else if (parent.name.toUpperCase() === 'ARRAY')
            {
                let valType = parent.types[0];

                if (!valType)
                {
                    warn('Unable to resolve array value type, defaulting to \`any\`.', parent);
                    valType = anyGeneric;
                }

                if (!valType.resolved)
                {
                    warn('Unable to resolve array value type, defaulting to \`any\`.', parent);
                    valType.resolved = anyTypeNode;
                }

                lastType = parent.resolved = ts.createArrayTypeNode(valType.resolved);
            }
            else
            {
                const typeNodes: ts.TypeNode[] = [];

                for (let i = 0; i < parent.types.length; ++i)
                {
                    let valType = parent.types[i];

                    if (!valType)
                    {
                        warn('Unable to resolve generic type parameter, defaulting to \`any\`.', parent);
                        valType = anyGeneric;
                    }

                    if (!valType.resolved)
                    {
                        warn('Unable to resolve generic type parameter, defaulting to \`any\`.', parent);
                        valType.resolved = anyTypeNode;
                    }

                    typeNodes.push(valType.resolved);
                }

                lastType = parent.resolved = ts.createTypeReferenceNode(parent.name, typeNodes);
            }
        }

        parent = parent.parent;
    }

    if (lastType === null)
        return anyTypeNode;

    return lastType;
}

export function resolveTypeLiteral(props?: IDocletProp[]): ts.TypeLiteralNode
{
    if (!props)
        return ts.createTypeLiteralNode([]);

    const tree = new PropTree(props);

    return createTypeLiteral(tree.roots);
}

export function createTypeLiteral(nodes: IPropDesc[]): ts.TypeLiteralNode
{
    const members: ts.PropertySignature[] = [];

    for (let i = 0; i < nodes.length; ++i)
    {
        const node = nodes[i];
        const opt = node.prop.optional ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined;
        const t = node.children.length ? createTypeLiteral(node.children) : resolveType(node.prop.type);

        members.push(ts.createPropertySignature(
            undefined,      // modifiers
            node.name,      // name
            opt,            // questionToken
            t,              // type
            undefined       // initializer
        ));
    }

    return ts.createTypeLiteralNode(members);
}

export function createFunctionParams(doclet: IFunctionDoclet | ITypedefDoclet): ts.ParameterDeclaration[]
{
    if (!doclet.params || !doclet.params.length)
        return [];

    const params: ts.ParameterDeclaration[] = [];
    const tree = new PropTree(doclet.params);

    if (doclet.this)
    {
        const type = resolveType({ names: [ doclet.this ] }, doclet);

        params.push(ts.createParameter(
            undefined,          // decorators
            undefined,          // modifiers
            undefined,          // dotDotDotToken
            'this',             // name
            undefined,          // questionToken
            type,               // type
            undefined           // initializer
        ));
    }

    for (let i = 0; i < tree.roots.length; ++i)
    {
        const node = tree.roots[i];
        const type = node.children.length ? createTypeLiteral(node.children) : resolveType(node.prop.type);
        const opt = resolveOptional(node.prop);
        const dots = resolveVariable(node.prop);

        params.push(ts.createParameter(
            undefined,          // decorators
            undefined,          // modifiers
            dots,               // dotDotDotToken
            node.name,          // name
            opt,                // questionToken
            type,               // type
            undefined           // initializer
        ));
    }

    return params;
}

export function createFunctionReturnType(doclet: IFunctionDoclet | ITypedefDoclet): ts.TypeNode
{
    if (doclet.returns && doclet.returns.length === 1)
    {
        return resolveType(doclet.returns[0].type, doclet);
    }
    else
    {
        return ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    }
}
