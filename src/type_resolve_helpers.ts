import * as ts from 'typescript';
import { Dictionary } from './Dictionary';
import { warn } from './logger';
import { PropTree, IPropDesc } from './PropTree';

const rgxObjectTokenize = /<|>|,/;
const rgxCommaAll = /,/g;

const anyTypeNode = ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);

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

    if (upperName.startsWith('ARRAY.') || upperName.startsWith('OBJECT.'))
        return resolveObjectType(name);

    // TODO: Type parameters for type references
    return ts.createTypeReferenceNode(name, undefined);
}

interface IObjectType_Object
{
    kind: 'object';
    parent?: TObjectTypeParent;
    keyType?: IObjectType_Type;
    valType?: TObjectType;
}

interface IObjectType_Array
{
    kind: 'array';
    parent?: TObjectTypeParent;
    valType?: TObjectType;
}

interface IObjectType_Type
{
    kind: 'type';
    parent?: TObjectTypeParent;
    type: string;
}

type TObjectTypeParent = IObjectType_Object | IObjectType_Array;
type TObjectType = TObjectTypeParent | IObjectType_Type;

function addToObjectTypeParentStack(obj: TObjectType, parentStack: TObjectTypeParent[])
{
    const parent = parentStack[parentStack.length - 1];

    if (parent)
    {
        obj.parent = parent;

        if (parent.kind === 'object')
        {
            if (parent.keyType)
            {
                parent.valType = obj;
                parentStack.pop();
            }
            else if (obj.kind === 'type')
            {
                parent.keyType = obj;
            }
            else
            {
                warn(`Invalid object key type. It must be \`string\` or \`number\`, but got: ${obj.kind}. Defaulting to \`string\`.`);
                parent.keyType = { kind: 'type', type: 'string' };
            }
        }
        else
        {
            parent.valType = obj;
            parentStack.pop();
        }
    }

    if (obj.kind === 'object' || obj.kind === 'array')
        parentStack.push(obj);
}

export function resolveObjectType(name: string): ts.TypeNode
{
    const parts = name.split(rgxObjectTokenize);

    if (parts.length <= 1)
    {
        warn('Invalid object type encountered, this is likely due to invalid JSDoc. Defaulting to \`any\`.', name);
        return anyTypeNode;
    }

    let lastObj: TObjectType | null = null;
    let parentStack: TObjectTypeParent[] = [];

    // Build a tree representing the
    for (let i = 0; i < parts.length; ++i)
    {
        if (!parts[i])
            continue;

        const upperPart = parts[i].toUpperCase().trim();
        let obj: TObjectType;

        if (upperPart === 'OBJECT.')
            obj = { kind: 'object' };
        else if (upperPart === 'ARRAY.')
            obj = { kind: 'array' };
        else
            obj = { kind: 'type', type: parts[i].trim() };

        addToObjectTypeParentStack(obj, parentStack);
        lastObj = obj;
    }

    if (!lastObj || !lastObj.parent)
    {
        warn('Unable to resolve Object/Array complex type. Defaulting to \`any\`.', name);
        return anyTypeNode;
    }

    return resolveObjectTypeTree(lastObj.parent);
}

function resolveObjectTypeTree(bottom: TObjectTypeParent)
{
    let lastType: ts.TypeNode | null = null;
    let parent: TObjectTypeParent | undefined = bottom;

    while (parent)
    {
        if (parent.kind === 'object')
        {
            if (!parent.keyType)
            {
                warn(`Unable to resolve object key type, this is likely due to invalid JSDoc. Defaulting to \`string\`.`);
                parent.keyType = { kind: 'type', type: 'string' };
            }
            else if (parent.keyType.type !== 'string' && parent.keyType.type !== 'number')
            {
                const name = parent.keyType.kind === 'type' ? parent.keyType.type : parent.keyType.kind;
                warn(`Invalid object key type. It must be \`string\` or \`number\`, but got: ${name}. Defaulting to \`string\`.`);
                parent.keyType = { kind: 'type', type: 'string' };
            }

            if (!parent.valType)
            {
                warn('Unable to resolve object value type, this is likely due to invalid JSDoc. Defaulting to \`any\`.', parent);
                parent.valType = { kind: 'type', type: 'any' };
            }

            let keyTypeKind = toKeywordTypeKind(parent.keyType.type);

            if (keyTypeKind !== ts.SyntaxKind.StringKeyword
                && keyTypeKind !== ts.SyntaxKind.NumberKeyword)
            {
                warn(`Invalid object key type. It must be \`string\` or \`number\`, but got: ${name}. Defaulting to \`string\`.`);
                keyTypeKind = ts.SyntaxKind.StringKeyword;
            }

            const indexParam = ts.createParameter(
                undefined,
                undefined,
                undefined,
                'key',
                undefined,
                ts.createKeywordTypeNode(keyTypeKind),
                undefined
            );

            let valType = parent.valType.kind === 'type' ? resolveTypeName(parent.valType.type) : lastType;

            if (!valType)
            {
                warn('Unable to resolve object value type, this is likely a bug. Defaulting to \`any\`.', parent);
                valType = anyTypeNode;
            }

            const indexSignature = ts.createIndexSignature(
                undefined,
                undefined,
                [indexParam],
                valType
            );

            lastType = ts.createTypeLiteralNode([indexSignature]);
        }
        else if (parent.kind === 'array')
        {
            if (!parent.valType)
            {
                warn('Unable to resolve array value type, defaulting to \`any\`.', parent);
                lastType = ts.createArrayTypeNode(anyTypeNode);
            }
            else
            {
                const val = parent.valType;
                let valType = val.kind === 'type' ? resolveTypeName(val.type) : lastType;

                if (!valType)
                {
                    warn('Unable to resolve array value type, defaulting to \`any\`.', parent);
                    valType = anyTypeNode;
                }

                lastType = ts.createArrayTypeNode(valType);
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
