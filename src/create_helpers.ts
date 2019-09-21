import * as ts from 'typescript';
import { warn, debug, docletDebugInfo } from './logger';
import {
    createFunctionParams,
    createFunctionReturnType,
    createTypeLiteral,
    resolveHeritageClauses,
    resolveType,
    resolveTypeParameters,
    resolveOptionalFromName
} from './type_resolve_helpers';
import { PropTree } from "./PropTree";

const declareModifier = ts.createModifier(ts.SyntaxKind.DeclareKeyword);
const constModifier = ts.createModifier(ts.SyntaxKind.ConstKeyword);
const readonlyModifier = ts.createModifier(ts.SyntaxKind.ReadonlyKeyword);
const exportModifier = ts.createModifier(ts.SyntaxKind.ExportKeyword);
const defaultModifier = ts.createModifier(ts.SyntaxKind.DefaultKeyword);

function validateClassLikeChildren(children: ts.Node[] | undefined, validate: (n: ts.Node) => boolean, msg: string)
{
    // Validate that the children array actually contains type elements.
    // This should never trigger, but is here for safety.
    if (children)
    {
        for (let i = children.length - 1; i >= 0; --i)
        {
            const child = children[i];
            if (!validate(child))
            {
                warn(`Encountered child that is not a ${msg}, this is likely due to invalid JSDoc.`, child);
                children.splice(i, 1);
            }
        }
    }
}

function validateClassChildren(children: ts.Node[] | undefined)
{
    return validateClassLikeChildren(children, ts.isClassElement, 'ClassElement');
}

function validateInterfaceChildren(children: ts.Node[] | undefined)
{
    return validateClassLikeChildren(children, ts.isTypeElement, 'TypeElement');
}

function validateModuleChildren(children?: ts.Node[])
{
    // Validate that the children array actually contains declaration elements.
    // This should never trigger, but is here for safety.
    if (children)
    {
        for (let i = children.length - 1; i >= 0; --i)
        {
            const child = children[i];
            if (!ts.isClassDeclaration(child)
                && !ts.isInterfaceDeclaration(child)
                && !ts.isFunctionDeclaration(child)
                && !ts.isEnumDeclaration(child)
                && !ts.isModuleDeclaration(child)
                && !ts.isTypeAliasDeclaration(child)
                && !ts.isVariableStatement(child)
                && !ts.isExportAssignment(child))
            {
                warn('Encountered child that is not a supported declaration, this is likely due to invalid JSDoc.', child);
                children.splice(i, 1);
            }
        }
    }
}

function buildName(doclet: IDocletBase, altName?: string): ts.Identifier
{
    if (altName)
        return ts.createIdentifier(altName);
    if (doclet.name.startsWith('exports.'))
        return ts.createIdentifier(doclet.name.replace('exports.', ''));
    return ts.createIdentifier(doclet.name);
}

function buildOptionalName(doclet: IDocletBase, altName?: string): ts.Identifier | undefined
{
    if (altName)
        return ts.createIdentifier(altName);
    if (doclet.meta && (doclet.meta.code.name === 'module.exports'))
        return undefined;
    if (doclet.name.startsWith('exports.'))
        return ts.createIdentifier(doclet.name.replace('exports.', ''));
    return ts.createIdentifier(doclet.name);
}

function handleComment<T extends ts.Node>(doclet: IDocletBase, node: T): T
{
    if (doclet.comment && doclet.comment.length > 4)
    {
        let comment = doclet.comment;

        // remove '/*' and '*/'
        comment = comment.substring(2, doclet.comment.length - 2);

        // remove '          *' leading spaces
        comment = comment.replace(/[ \t]+\*/g, ' *');

        // remove trailing spacesgit dif
        comment = comment.trim() + '\n ';

        const kind = ts.SyntaxKind.MultiLineCommentTrivia;

        ts.addSyntheticLeadingComment(node, kind, comment, true);
    }

    return node;
}

export function createClass(doclet: IClassDoclet, children?: ts.Node[], altName?: string): ts.ClassDeclaration
{
    debug(`createClass(${docletDebugInfo(doclet)}, altName=${altName})`);

    validateClassChildren(children);

    const mods: ts.Modifier[] = [];
    if (!doclet.memberof)
        mods.push(declareModifier);
    if (doclet.meta && (doclet.meta.code.name === 'module.exports'))
        mods.push(exportModifier, defaultModifier);
    const members = children as ts.ClassElement[] || [];
    const typeParams = resolveTypeParameters(doclet);
    const heritageClauses = resolveHeritageClauses(doclet, false);

    if (doclet.params)
    {
        // Check whether the constructor has already been declared.
        if (members.filter(member => ts.isConstructorDeclaration(member)).length === 0)
        {
            debug(`createClass(${docletDebugInfo(doclet)}): no constructor set yet, adding one automatically`);
            members.unshift(
                ts.createConstructor(
                    undefined,                      // decorators
                    undefined,                      // modifiers
                    createFunctionParams(doclet),   // parameters
                    undefined                       // body
                )
            );
        }
    }

    if (doclet.properties)
    {
        const tree = new PropTree(doclet.properties);

        for (let i = 0; i < tree.roots.length; ++i)
        {
            const node = tree.roots[i];
            const opt = node.prop.optional ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined;
            const t = node.children.length ? createTypeLiteral(node.children) : resolveType(node.prop.type);

            const property = ts.createProperty(
                undefined,
                undefined,
                node.name,
                opt,
                t,
                undefined
            );

            if (node.prop.description)
            {
                let comment = `*\n * ${node.prop.description.split(/\r\s*/).join("\n * ")}\n`;
                ts.addSyntheticLeadingComment(property, ts.SyntaxKind.MultiLineCommentTrivia, comment, true)
            }

            members.push(property);
        }
    }

    return handleComment(doclet, ts.createClassDeclaration(
        undefined,      // decorators
        mods,           // modifiers
        buildOptionalName(doclet, altName), // name
        typeParams,     // typeParameters
        heritageClauses,// heritageClauses
        members         // members
    ));
}

export function createInterface(doclet: IClassDoclet, children?: ts.Node[], altName?: string): ts.InterfaceDeclaration
{
    debug(`createInterface(${docletDebugInfo(doclet)}, altName=${altName})`);

    validateInterfaceChildren(children);

    const mods = doclet.memberof ? undefined : [declareModifier];
    const members = children as ts.TypeElement[];
    const typeParams = resolveTypeParameters(doclet);
    const heritageClauses = resolveHeritageClauses(doclet, true);

    return handleComment(doclet, ts.createInterfaceDeclaration(
        undefined,      // decorators
        mods,           // modifiers
        buildName(doclet, altName), // name, avoid undefined
        typeParams,     // typeParameters
        heritageClauses,// heritageClauses
        members         // members
    ));
}

export function createFunction(doclet: IFunctionDoclet, altName?: string): ts.FunctionDeclaration
{
    debug(`createFunction(${docletDebugInfo(doclet)}, altName=${altName})`);

    const mods = [];
    if (!doclet.memberof)
        mods.push(declareModifier);
    if (doclet.meta && (doclet.meta.code.name === 'module.exports'))
        mods.push(exportModifier, defaultModifier);
    const params = createFunctionParams(doclet);
    const type = createFunctionReturnType(doclet);
    const typeParams = resolveTypeParameters(doclet);

    return handleComment(doclet, ts.createFunctionDeclaration(
        undefined,      // decorators
        mods,           // modifiers
        undefined,      // asteriskToken
        buildOptionalName(doclet, altName), // name
        typeParams,     // typeParameters
        params,         // parameters
        type,           // type
        undefined       // body
    ));
}

export function createClassMethod(doclet: IFunctionDoclet): ts.MethodDeclaration
{
    debug(`createClassMethod(${docletDebugInfo(doclet)})`);

    const mods: ts.Modifier[] = [];
    const params = createFunctionParams(doclet);
    const type = createFunctionReturnType(doclet);
    const typeParams = resolveTypeParameters(doclet);

    if (!doclet.memberof)
        mods.push(declareModifier);

    if (doclet.access === 'private')
        mods.push(ts.createModifier(ts.SyntaxKind.PrivateKeyword));
    else if (doclet.access === 'protected')
        mods.push(ts.createModifier(ts.SyntaxKind.ProtectedKeyword));
    else if (doclet.access === 'public')
        mods.push(ts.createModifier(ts.SyntaxKind.PublicKeyword));

    if (doclet.scope === 'static')
        mods.push(ts.createModifier(ts.SyntaxKind.StaticKeyword));

    const [ name, questionToken ] = resolveOptionalFromName(doclet);
    return handleComment(doclet, ts.createMethod(
        undefined,      // decorators
        mods,           // modifiers
        undefined,      // asteriskToken
        name,           // name
        questionToken,  // questionToken
        typeParams,     // typeParameters
        params,         // parameters
        type,           // type
        undefined       // body
    ));
}

export function createInterfaceMethod(doclet: IFunctionDoclet): ts.MethodSignature
{
    debug(`createInterfaceMethod(${docletDebugInfo(doclet)})`);

    const mods: ts.Modifier[] = [];
    const params = createFunctionParams(doclet);
    const type = createFunctionReturnType(doclet);
    const typeParams = resolveTypeParameters(doclet);

    const [ name, questionToken ] = resolveOptionalFromName(doclet);
    return handleComment(doclet, ts.createMethodSignature(
        typeParams,     // typeParameters
        params,         // parameters
        type,           // type
        name,           // name
        questionToken,  // questionToken
    ));
}

export function createEnum(doclet: IMemberDoclet, altName?: string): ts.EnumDeclaration
{
    debug(`createEnum(${docletDebugInfo(doclet)}, altName=${altName})`);

    const mods: ts.Modifier[] = [];
    const props: ts.EnumMember[] = [];

    if (!doclet.memberof)
        mods.push(declareModifier);

    if (doclet.kind === 'constant')
        mods.push(constModifier);

    if (doclet.properties && doclet.properties.length)
    {
        for (let i = 0; i < doclet.properties.length; ++i)
        {
            const p = doclet.properties[i];
            const l = p.defaultvalue !== undefined ? ts.createLiteral(p.defaultvalue) : undefined;

            props.push(ts.createEnumMember(p.name, l));
        }
    }

    return handleComment(doclet, ts.createEnumDeclaration(
        undefined,
        mods,
        buildName(doclet, altName),
        props,
    ));
}

export function createClassMember(doclet: IMemberDoclet): ts.PropertyDeclaration
{
    debug(`createClassMember(${docletDebugInfo(doclet)})`);

    const type = resolveType(doclet.type, doclet);

    const mods: ts.Modifier[] = getAccessModifiers(doclet);

    if (doclet.scope === 'static')
        mods.push(ts.createModifier(ts.SyntaxKind.StaticKeyword));

    if (doclet.kind === 'constant' || doclet.readonly)
        mods.push(readonlyModifier);

    const [ name, questionToken ] = resolveOptionalFromName(doclet);
    return handleComment(doclet, ts.createProperty(
        undefined,      // decorators
        mods,           // modifiers
        name,           // name
        questionToken,  // questionToken
        type,           // type
        undefined       // initializer
    ));
}

function getAccessModifiers(doclet: IMemberDoclet | IClassDoclet): ts.Modifier[]
{
    const mods: ts.Modifier[] = [];

    if (doclet.access === 'private' || doclet.access === 'package')
        mods.push(ts.createModifier(ts.SyntaxKind.PrivateKeyword));
    else if (doclet.access === 'protected')
        mods.push(ts.createModifier(ts.SyntaxKind.ProtectedKeyword));
    else if (doclet.access === 'public')
        mods.push(ts.createModifier(ts.SyntaxKind.PublicKeyword));

    return mods
}

export function createConstructor(doclet: IClassDoclet): ts.ConstructorDeclaration
{
    debug(`createConstructor(${docletDebugInfo(doclet)})`);

    return handleComment(doclet, ts.createConstructor(
        undefined,                      // decorators
        getAccessModifiers(doclet),     // modifiers
        createFunctionParams(doclet),   // parameters
        undefined                       // body
    ))
}

export function createInterfaceMember(doclet: IMemberDoclet): ts.PropertySignature
{
    debug(`createInterfaceMember(${docletDebugInfo(doclet)})`);

    const mods: ts.Modifier[] = [];
    const type = resolveType(doclet.type, doclet);

    if (doclet.kind === 'constant')
        mods.push(readonlyModifier);

    if (doclet.scope === 'static')
        mods.push(ts.createModifier(ts.SyntaxKind.StaticKeyword));

    const [ name, questionToken ] = resolveOptionalFromName(doclet);
    return handleComment(doclet, ts.createPropertySignature(
        mods,           // modifiers
        name,           // name
        questionToken,  // questionToken
        type,           // type
        undefined       // initializer
    ));
}

/**
 * Used for both namespace and module members.
 * `altName` may be set for an exported module member.
 */
export function createNamespaceMember(doclet: IMemberDoclet, altName?: string): ts.VariableStatement
{
    debug(`createNamespaceMember(${docletDebugInfo(doclet)})`);

    const mods = doclet.memberof ? undefined : [declareModifier];
    const flags = (doclet.kind === 'constant' || doclet.readonly) ? ts.NodeFlags.Const : undefined;

    const literalValue = doclet.defaultvalue !== undefined ? doclet.defaultvalue
                         : doclet.meta && doclet.meta.code.type === 'Literal' ? doclet.meta.code.value
                         : undefined;
    const initializer = (flags === ts.NodeFlags.Const && literalValue !== undefined) ? ts.createLiteral(literalValue) : undefined;

    // ignore regular type if constant literal, because a literal provides more type information
    const type = initializer ? undefined : resolveType(doclet.type, doclet);

    return handleComment(doclet, ts.createVariableStatement(
        mods,
        ts.createVariableDeclarationList([
            ts.createVariableDeclaration(
                buildName(doclet, altName), // name
                type,           // type
                initializer     // initializer
                )
            ],
            flags,
        )
    ));
}

export function createExportDefault(doclet: IMemberDoclet, value: string): ts.ExportAssignment | null
{
    debug(`createExportDefault(${docletDebugInfo(doclet)}, '${value}')`);

    const expression : ts.Expression = ts.createIdentifier(value);
    return handleComment(doclet, ts.createExportDefault(expression));
}

export function createModule(doclet: INamespaceDoclet, nested: boolean, children?: ts.Node[]): ts.ModuleDeclaration
{
    debug(`createModule(${docletDebugInfo(doclet)})`);

    validateModuleChildren(children);

    const mods = doclet.memberof ? undefined : [declareModifier];
    let body: ts.ModuleBlock | undefined = undefined;
    let flags = ts.NodeFlags.None;

    if (nested)
        flags |= ts.NodeFlags.NestedNamespace;

    if (children)
        body = ts.createModuleBlock(children as ts.Statement[]);

    const name = ts.createStringLiteral(doclet.name);

    return handleComment(doclet, ts.createModuleDeclaration(
        undefined,      // decorators
        mods,           // modifiers
        name,           // name
        body,           // body
        flags           // flags
    ));
}

export function createNamespace(doclet: INamespaceDoclet, nested: boolean, children?: ts.Node[], altName?: string): ts.ModuleDeclaration
{
    debug(`createNamespace(${docletDebugInfo(doclet)}, altName=${altName})`);

    validateModuleChildren(children);

    const mods = doclet.memberof ? undefined : [declareModifier];
    let body: ts.ModuleBlock | undefined = undefined;
    let flags = ts.NodeFlags.Namespace;

    if (nested)
        flags |= ts.NodeFlags.NestedNamespace;

    if (children)
    {
        body = ts.createModuleBlock(children as ts.Statement[]);
    }

    return handleComment(doclet, ts.createModuleDeclaration(
        undefined,      // decorators
        mods,           // modifiers
        buildName(doclet, altName), // name
        body,           // body
        flags           // flags
    ));
}

export function createTypedef(doclet: ITypedefDoclet, children?: ts.Node[], altName?: string): ts.TypeAliasDeclaration
{
    debug(`createTypedef(${docletDebugInfo(doclet)}, altName=${altName})`);

    const mods = doclet.memberof ? undefined : [declareModifier];
    const type = resolveType(doclet.type, doclet);
    const typeParams = resolveTypeParameters(doclet);

    return handleComment(doclet, ts.createTypeAliasDeclaration(
        undefined,      // decorators
        mods,           // modifiers
        buildName(doclet, altName), // name
        typeParams,     // typeParameters
        type            // type
    ));
}
