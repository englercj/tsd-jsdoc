import * as ts from 'typescript';
import { Dictionary } from './Dictionary';
import { warn } from './logger';

const rgxArrayType = /^[aA]rray(?:\.<(.*)>)?$/;
const rgxObjectType = /^[oO]bject\.<(\w*),\s*\(?(.*)\)?>$/;

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

export function resolveType(t: IDocletType, props?: IDocletProp[]): ts.TypeNode
{
    if (!t || !t.names || t.names.length === 0)
    {
        if (props)
            return resolveTypeName('object', props);

        warn('Unable to resolve type, invalid data from jsdoc. Defaulting to `any`.', t);
        return ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    }

    if (t.names.length === 1)
    {
        return resolveTypeName(t.names[0], props);
    }
    else
    {
        const types: ts.TypeNode[] = [];

        for (let i = 0; i < t.names.length; ++i)
        {
            types.push(resolveTypeName(t.names[i], props));
        }

        return ts.createUnionTypeNode(types);
    }
}

export function resolveTypeName(name: string, props?: IDocletProp[]): ts.TypeNode
{
    if (!name)
    {
        warn('Unable to resolve type name, it is null, undefined, or empty.');
        return ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    }

    // Handle keyword and reference names
    const keyword = toKeywordTypeKind(name);

    if (keyword !== null)
    {
        if (keyword === ts.SyntaxKind.ThisKeyword)
            return ts.createThisTypeNode();

        if (keyword === ts.SyntaxKind.ObjectKeyword)
        {
            if (name.toUpperCase() === 'OBJECT' && !props)
                return ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
            else
                return resolveTypeLiteral(props);
        }

        return ts.createKeywordTypeNode(keyword);
    }

    // Handle array type names
    const arrayMatches = name.match(rgxArrayType);

    if (arrayMatches)
    {
        if (arrayMatches[1])
        {
            return ts.createArrayTypeNode(resolveTypeName(arrayMatches[1]));
        }
        else
        {
            warn(`Unable to resolve array type, got a malformed array string: ${name}. Defaulting to \`any[]\`.`);
            return ts.createArrayTypeNode(ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
        }
    }

    // Handle object type names
    const objectMatches = name.match(rgxObjectType);

    if (objectMatches && objectMatches[1] && objectMatches[2])
    {
        let indexTypeKind = toKeywordTypeKind(objectMatches[1].trim());
        const valueTypeStr = objectMatches[2].trim();

        if (indexTypeKind !== ts.SyntaxKind.StringKeyword
            && indexTypeKind !== ts.SyntaxKind.NumberKeyword)
        {
            warn(`Invalid object key. It must be \`string\` or \`number\`, but got: ${name}. Defaulting to \`string\`.`);
            indexTypeKind = ts.SyntaxKind.StringKeyword;
        }

        const indexParam = ts.createParameter(
            undefined,
            undefined,
            undefined,
            'key',
            undefined,
            ts.createKeywordTypeNode(indexTypeKind),
            undefined
        )

        const indexSignature = ts.createIndexSignature(
            undefined,
            undefined,
            [indexParam],
            resolveTypeName(valueTypeStr)
        );

        return ts.createTypeLiteralNode([indexSignature]);
    }

    // TODO: Type parameters for type references
    return ts.createTypeReferenceNode(name, undefined);
}


export function resolveTypeLiteral(props?: IDocletProp[]): ts.TypeLiteralNode
{
    if (!props)
        return ts.createTypeLiteralNode([]);

    const roots: IPropDesc[] = [];
    const nodes: Dictionary<IPropDesc> = {};

    // create all node for each property
    for (let i = 0; i < props.length; ++i)
    {
        const prop = props[i];
        const parts = prop.name.split('.');

        nodes[prop.name] = {
            prop,
            name: parts[parts.length - 1],
            children: [],
        };
    }

    // build the tree of props
    for (let i = 0; i < props.length; ++i)
    {
        const prop = props[i];
        const parts = prop.name.split('.');

        const obj = nodes[prop.name];

        if (!obj)
        {
            // TODO LOG WARNING
            continue;
        }

        if (parts.length > 1)
        {
            parts.pop();
            const parentName = parts.join('.');
            const parent = nodes[parentName];

            if (!parent)
            {
                // TODO LOG WARNING
                continue;
            }

            parent.children.push(obj);
        }
        else
        {
            roots.push(obj)
        }
    }

    return createTypeLiteral(roots);
}

interface IPropDesc
{
    prop: IDocletProp;
    name: string;
    children: IPropDesc[];
}

function createTypeLiteral(nodes: IPropDesc[]): ts.TypeLiteralNode
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
