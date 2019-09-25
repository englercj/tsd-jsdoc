import * as ts from 'typescript';
import { warn } from './logger';
import { PropTree, IPropDesc } from './PropTree';

const rgxObjectTokenize = /(<|>|,|\(|\)|\||\{|\}|:)/;
const rgxCommaAll = /,/g;
const rgxParensAll = /\(|\)/g;

const anyTypeNode = ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
const voidTypeNode = ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
const strTypeNode = ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);

enum ENodeType {
    GENERIC,    // Foo.<X,Y>    has types for children
    UNION,      // (a|b|c)      has types for children
    FUNCTION,   // function(a) : returnType     has arguments for children, and last child is return type
    TUPLE,      // [a,b]        has types for children
    TYPE,       // string, X    has no children
    OBJECT,     // {a:b, c:d}   has name value pairs for children
}
export class StringTreeNode {
    children: StringTreeNode[] = [];
    constructor(public name: string, public type: ENodeType, public parent: StringTreeNode | null)
    { }

    dump(output: (msg: string) => void, indent: number = 0) : void
    {
        output(`${'  '.repeat(indent)}name: ${this.name}, type:${this.typeToString()}`);
        this.children.forEach((child) => {
            child.dump(output, indent + 1);
        });
    }

    walkTypes(callback: (treeNode: StringTreeNode) => void) : void
    {
        for (let i=0; i<this.children.length; i++)
        {
            // Skip object field names.
            if ((this.type === ENodeType.OBJECT) && (i % 2 === 0))
                continue;
            this.children[i].walkTypes(callback);
        }
        callback(this);
    }

    typeToString() : string
    {
        switch (this.type)
        {
            case ENodeType.GENERIC:
                return 'GENERIC';
            case ENodeType.UNION:
                return 'UNION';
            case ENodeType.FUNCTION:
                return 'FUNCTION';
            case ENodeType.TUPLE:
                return 'TUPLE';
            case ENodeType.TYPE:
                return 'TYPE';
            case ENodeType.OBJECT:
                return 'OBJECT';
            default:
                return 'UNKNOWN'
        }
    }
}

export function resolveComplexTypeName(name: string, doclet?: TTypedDoclet): ts.TypeNode
{
    // parse the string into a tree of tsNodeType's
    const root = generateTree(name);
    if (!root)
    {
        warn(`failed to generate tree for ${name}, defaulting to any`);
        return anyTypeNode;
    }
    // root.dump();

    // walk the tree generating the ts.TypeNode's tree
    return resolveTree(root);
}

export function generateTree(name: string, parent: StringTreeNode | null = null) : StringTreeNode | null
{
    const anyNode = new StringTreeNode('any', ENodeType.TYPE, parent);
    const parts = name.split(rgxObjectTokenize).filter(function (e) {
        return e.trim() !== '';
    });

    for (let i = 0; i < parts.length; ++i)
    {
        const part = parts[i].trim();
        const partUpper = part.toUpperCase();

        // Generic
        if (part.endsWith('.'))
        {
            const matchingIndex = findMatchingBracket(parts, i + 1, '<', '>');
            if (matchingIndex === -1)
            {
                warn(`Unable to find matching '<', '>' brackets in '${part}', defaulting to \`any\``, name);
                return anyNode;
            }

            const node = new StringTreeNode(part.substring(0,part.length-1), ENodeType.GENERIC, parent);
            generateTree(parts.slice(i + 2, matchingIndex).join(''), node); // strip the < and > from front and back

            if (!parent)
                return node;

            parent.children.push(node);
            i = matchingIndex + 1;
            continue;
        }

        // Union
        if (part === '(')
        {
            const matchingIndex = findMatchingBracket(parts, i, '(', ')');
            if (matchingIndex === -1)
            {
                warn(`Unable to find matching '(', ')' brackets in '${part}', defaulting to \`any\``, name);
                return anyNode;
            }

            const node = new StringTreeNode('Union', ENodeType.UNION, parent);
            generateTree(parts.slice(i + 1, matchingIndex).join(''), node);
            if (!parent)
                return node;

            parent.children.push(node);
            i = matchingIndex + 1;
            continue;
        }

        // Object
        if (part === '{')
        {
            const matchingIndex = findMatchingBracket(parts, i, '{', '}');
            if (matchingIndex === -1)
            {
                warn(`Unable to find matching '{', '}' brackets in '${part}', defaulting to \`any\``, name);
                return anyNode;
            }

            const node = new StringTreeNode('Object', ENodeType.OBJECT, parent);
            generateTree(parts.slice(i + 1, matchingIndex).join(''), node);
            if (!parent)
                return node;

            parent.children.push(node);
            i = matchingIndex + 1;
            continue;
        }

        // Function
        if (partUpper === 'FUNCTION')
        {
            const node = new StringTreeNode(part, ENodeType.FUNCTION, parent);

            let matchingIndex = findMatchingBracket(parts, i + 1, '(', ')');
            if (matchingIndex === -1)
            {
                warn(`Unable to find matching '(', ')' brackets in '${part}', defaulting to \`any\``, name);
                return anyNode;
            }

            // only get children types if there is something between the brackets
            if (matchingIndex > i + 2)
                generateTree(parts.slice(i + 2, matchingIndex).join(''), node);

            // check if there is a return type specified
            if (parts.length > matchingIndex + 2 && parts[matchingIndex + 1] === ':')
            {
                generateTree(parts[matchingIndex + 2], node);
                matchingIndex += 2;
            }
            else
            {
                // else use void for the return type
                node.children.push(new StringTreeNode('void', ENodeType.TYPE, node));
            }

            if (!parent)
                return node;

            parent.children.push(node);
            i = matchingIndex + 1;
            continue;
        }

        // TODO: Tuples?

        // skip separators, our handling below takes them into account
        if (part === '|' || part === ',' || part === ':')
        {
            continue;
        }

        // if we get here it is a basic type
        const node = new StringTreeNode(part, ENodeType.TYPE, parent);
        if (part === '*')
            node.name = 'any';
        else if (partUpper === 'OBJECT')
            node.name = 'object';
        else if (partUpper === 'ARRAY')
            node.name = 'any[]';

        if (!parent)
            return node;

        // add ourselves to our parent as a child
        parent.children.push(node);
    }

    return anyNode;
}

function findMatchingBracket(parts: string[], startIndex: number, openBracket: string, closeBracket: string) : number
{
    let count = 0;
    for (let i = startIndex; i < parts.length; ++i)
    {
        if (parts[i] === openBracket)
        {
            ++count;
        }
        else if (parts[i] === closeBracket)
        {
            if (--count === 0)
            {
                return i;
            }
        }
    }
    return -1;
}

function resolveTree(node: StringTreeNode, parentTypes: ts.TypeNode[] | null = null) : ts.TypeNode
{
    // this nodes resolved child types
    const childTypes: ts.TypeNode[] = [];

    // recursively walk the tree by calling this function on each of our children
    node.children.forEach((child) => resolveTree(child, childTypes));

    const upperName = node.name.toUpperCase();

    // resolve our type, do this for our parent (add our type to its children), or return our type if we have no parent (we are the root)
    switch (node.type)
    {
        case ENodeType.OBJECT:
            const objectProperties: ts.TypeElement[] = [];

            for (var i = 0; i < node.children.length; i = i + 2)
            {
                let valType = childTypes[i + 1];
                if (!valType)
                {
                    warn('Unable to resolve object value type, this is likely due to invalid JSDoc. Defaulting to \`any\`.', node);
                    valType = anyTypeNode;
                }

                const property = ts.createPropertySignature(
                    undefined,              //modifiers
                    ts.createIdentifier(node.children[i].name),
                    undefined,              //question token
                    valType,
                    undefined               //initializer
                )

                objectProperties.push(property);
            }

            const objectNode = ts.createTypeLiteralNode(objectProperties);
            ts.setEmitFlags(objectNode, ts.EmitFlags.SingleLine);

            if (!parentTypes)
                return objectNode;

            parentTypes.push(objectNode);
            break;
        case ENodeType.GENERIC:
            let genericNode: ts.TypeNode;
            if (upperName === 'OBJECT')
            {
                let keyType = childTypes[0];
                if (!keyType)
                {
                    warn(`Unable to resolve object key type, this is likely due to invalid JSDoc. Defaulting to \`string\`.`);
                    keyType = strTypeNode;
                }
                else if (node.children[0].type !== ENodeType.TYPE || (node.children[0].name !== 'string' && node.children[0].name !== 'number'))
                {
                    warn(`Invalid object key type. It must be \`string\` or \`number\`, but got: ${node.children[0].name}. Defaulting to \`string\`.`);
                    keyType = strTypeNode;
                }

                let valType = childTypes[1];
                if (!valType)
                {
                    warn('Unable to resolve object value type, this is likely due to invalid JSDoc. Defaulting to \`any\`.', node);
                    valType = anyTypeNode;
                }

                const indexParam = ts.createParameter(
                    undefined,          // decorators
                    undefined,          // modifiers
                    undefined,          // dotDotDotToken
                    'key',              // name
                    undefined,          // questionToken
                    keyType,            // type
                    undefined           // initializer
                );

                const indexSignature = ts.createIndexSignature(
                    undefined,          // decorators
                    undefined,          // modifiers
                    [indexParam],       // parameters
                    valType,            // type
                );

                genericNode = ts.createTypeLiteralNode([indexSignature]);
            }
            else if (upperName === 'ARRAY')
            {
                let valType = childTypes[0];

                if (!valType)
                {
                    warn('Unable to resolve array value type, defaulting to \`any\`.', node);
                    valType = anyTypeNode;
                }

                genericNode = ts.createArrayTypeNode(valType);
            }
            else if (upperName === 'CLASS')
            {
                let valType = childTypes[0];

                if (!valType)
                {
                    warn('Unable to resolve class value type, defaulting to \`any\`.', node);
                    valType = anyTypeNode;
                }

                // TODO: this seems wrong, doesn't use valType?
                genericNode = ts.createTypeQueryNode(ts.createIdentifier(node.children[0].name));
            }
            else
            {
                if (childTypes.length === 0 )
                {
                    warn('Unable to resolve generic type, defaulting to \`any\`.', node);
                    childTypes.push(anyTypeNode);
                }

                // it can be nice to document promises in the form of @return Promise<resolveType, rejectType>
                // however this causes issues in typescript which only specifies the resolveType
                // we'll remove the rejectType in this case
                if (upperName === 'PROMISE')
                {
                    while(childTypes.length > 1)
                        childTypes.pop();
                }

                genericNode = ts.createTypeReferenceNode(node.name, childTypes);
            }

            if (!parentTypes)
                return genericNode;

            parentTypes.push(genericNode);
            break;

        case ENodeType.UNION:
            if (childTypes.length === 0 )
            {
                warn('Unable to resolve any types for union, defaulting to \`any\`.', node);
                childTypes.push(anyTypeNode);
            }

            const unionNode = ts.createUnionTypeNode(childTypes);

            if (!parentTypes)
                return unionNode;

            parentTypes.push(unionNode);
            break;

        case ENodeType.FUNCTION:
            const funcParameters: ts.ParameterDeclaration[] = [];

            if (childTypes.length === 0 || childTypes.length === 1)
            {
                // default params is ...params: any[]
                const anyArray = ts.createArrayTypeNode(anyTypeNode);
                const dotDotDot = ts.createToken(ts.SyntaxKind.DotDotDotToken);
                funcParameters.push(ts.createParameter(
                    undefined,          // decorators
                    undefined,          // modifiers
                    dotDotDot,          // dotDotDotToken
                    'params',           // name
                    undefined,          // questionToken
                    anyArray,           // type
                    undefined           // initializer
                ));

                // default return type is void
                if (childTypes.length === 0)
                    childTypes.push(voidTypeNode);
            }

            // last child is the return type
            for (var i = 0; i < node.children.length - 1; ++i)
            {
                const param = ts.createParameter(
                    undefined,          // decorators
                    undefined,          // modifiers
                    undefined,          // dotDotDotToken
                    'arg' + i,          // name, we have to name the types, so use generic names, similar to typescripts transformJSDocFunctionType
                    undefined,          // questionToken
                    childTypes[i],      // type
                    undefined           // initializer
                );

                funcParameters.push(param);
            }

            const functionNode = ts.createFunctionTypeNode(
                undefined,                          // typeParameters
                funcParameters,                     // parameters
                childTypes[childTypes.length - 1]   // return type
            );

            if (!parentTypes)
                return functionNode;

            parentTypes.push(functionNode);
            break;

        case ENodeType.TYPE:
            const typeNode = ts.createTypeReferenceNode(node.name, undefined);

            if (!parentTypes)
                return typeNode;

            parentTypes.push(typeNode);
            break;

    }

    // if we get here we had a parent and we're resolving our type and adding ourselves to our parents list of children
    // as such this return is ignored by the caller
    return anyTypeNode;
}

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

export function resolveOptionalParameter(doclet: IDocletProp): ts.Token<ts.SyntaxKind.QuestionToken> | undefined
{
    if (doclet.defaultvalue || doclet.optional)
        return ts.createToken(ts.SyntaxKind.QuestionToken);

    return undefined;
}

export function resolveVariableParameter(doclet: IDocletProp): ts.Token<ts.SyntaxKind.DotDotDotToken> | undefined
{
    if (doclet.variable)
        return ts.createToken(ts.SyntaxKind.DotDotDotToken);

    return undefined;
}

export function resolveOptionalFromName(doclet: IDocletBase): [ string, ts.Token<ts.SyntaxKind.QuestionToken> | undefined ]
{
    let name = doclet.name;

    if (name.startsWith('[') && name.endsWith(']')) {
        name = name.substring(1, name.length - 1);
        return [ name, ts.createToken(ts.SyntaxKind.QuestionToken) ];
    }

    if (doclet.optional) {
        return [ name, ts.createToken(ts.SyntaxKind.QuestionToken) ];
    }

    return [ name, undefined ];
}

function getExprWithTypeArgs(identifier: string)
{
    const expr = ts.createIdentifier(identifier);
    return ts.createExpressionWithTypeArguments(undefined, expr);
}

export function resolveHeritageClauses(doclet: IClassDoclet, onlyExtend: boolean): ts.HeritageClause[]
{
    const clauses: ts.HeritageClause[] = [];
    let extensions: string[] = doclet.augments || [];

    if (onlyExtend)
    {
        extensions = extensions.concat(doclet.implements || []);
        extensions = extensions.concat(doclet.mixes || []);
    }

    if (extensions.length)
    {
        clauses.push(ts.createHeritageClause(
            ts.SyntaxKind.ExtendsKeyword,
            extensions.map(getExprWithTypeArgs),
        ));
    }

    if (onlyExtend)
        return clauses;

    let implementations = (doclet.implements || []).concat(doclet.mixes || []);

    if (implementations.length)
    {
        clauses.push(ts.createHeritageClause(
            ts.SyntaxKind.ImplementsKeyword,
            implementations.map(getExprWithTypeArgs),
        ));
    }

    return clauses;
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

export function resolveType(t?: IDocletType, doclet?: TTypedDoclet): ts.TypeNode
{
    if (!t || !t.names || t.names.length === 0)
    {
        if (doclet && doclet.properties)
            return resolveTypeName('object', doclet);

        if (doclet)
        {
            warn(`Unable to resolve type for ${doclet.longname || doclet.name}, none specified in JSDoc. Defaulting to \`any\`.`, doclet);
        }
        else
        {
            warn(`Unable to resolve type for an unnamed item, this is likely due to invalid JSDoc.` +
                ` Often this is caused by invalid JSDoc on a parameter. Defaulting to \`any\`.`, doclet);
        }

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

    if (upperName === 'FUNCTION' || upperName === 'FUNCTION()')
    {
        if (doclet && doclet.kind === 'typedef')
        {
            const params = createFunctionParams(doclet);
            const type = createFunctionReturnType(doclet);
            return ts.createFunctionTypeNode(
                undefined,      // typeParameters
                params,         // parameters
                type            // type
            );
        }
        else
        {
            const anyArray = ts.createArrayTypeNode(anyTypeNode);
            const dotDotDot = ts.createToken(ts.SyntaxKind.DotDotDotToken);
            const param = ts.createParameter(
                undefined,          // decorators
                undefined,          // modifiers
                dotDotDot,          // dotDotDotToken
                'params',           // name
                undefined,          // questionToken
                anyArray,           // type
                undefined           // initializer
            );
            return ts.createFunctionTypeNode(
                undefined,      // typeParameters
                [param],        // parameters
                anyTypeNode     // type
            );
        }
    }

    return resolveComplexTypeName(name);
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

export function createFunctionParams(doclet: IFunctionDoclet | ITypedefDoclet | IClassDoclet): ts.ParameterDeclaration[]
{
    if (!doclet.params || !doclet.params.length)
        return [];

    const params: ts.ParameterDeclaration[] = [];
    const tree = new PropTree(doclet.params);

    if ((doclet.kind === 'function' || doclet.kind === 'typedef') && doclet.this)
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
        const opt = resolveOptionalParameter(node.prop);
        const dots = resolveVariableParameter(node.prop);
        let type = node.children.length ? createTypeLiteral(node.children) : resolveType(node.prop.type);

        if (dots)
        {
            type = ts.createArrayTypeNode(type);
        }

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
