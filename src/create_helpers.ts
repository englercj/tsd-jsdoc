import * as ts from 'typescript';
import { warn } from './logger';
import { resolveType, createFunctionParams, createFunctionReturnType } from './type_resolve_helpers';

const declareModifier = ts.createModifier(ts.SyntaxKind.DeclareKeyword);
const constModifier = ts.createModifier(ts.SyntaxKind.ConstKeyword);
const readonlyModifier = ts.createModifier(ts.SyntaxKind.ReadonlyKeyword);

export function createClass(doclet: IClassDoclet, children?: ts.Node[]): ts.ClassDeclaration
{
    const mods = doclet.memberof ? undefined : [declareModifier];

    // Validate that the children array actually contains class elements.
    // This should never trigger, but is here for safety.
    if (children)
    {
        for (let i = children.length - 1; i >= 0; --i)
        {
            const child = children[i];
            if (!ts.isClassElement(child))
            {
                warn('Encountered child that is not a ClassElement, this is likely due to invalid JSDoc.', child);
                children.splice(i, 1);
            }
        }
    }

    const members = children as ts.ClassElement[];

    return ts.createClassDeclaration(
        undefined,      // decorators
        mods,           // modifiers
        doclet.name,    // name
        undefined,      // typeParameters
        undefined,      // heritageClauses
        members         // members
    );
}

export function createFunction(doclet: IFunctionDoclet): ts.FunctionDeclaration
{
    const mods = doclet.memberof ? undefined : [declareModifier];
    const params = createFunctionParams(doclet);
    const type = createFunctionReturnType(doclet);

    return ts.createFunctionDeclaration(
        undefined,      // decorators
        mods,           // modifiers
        undefined,      // asteriskToken
        doclet.name,    // name
        undefined,      // typeParameters
        params,         // parameters
        type,           // type
        undefined       // body
    );
}

export function createClassMethod(doclet: IFunctionDoclet): ts.MethodDeclaration
{
    const mods: ts.Modifier[] = [];
    const params = createFunctionParams(doclet);
    const type = createFunctionReturnType(doclet);

    if (!doclet.memberof)
        mods.push(declareModifier);

    if (doclet.scope === 'static')
        mods.push(ts.createModifier(ts.SyntaxKind.StaticKeyword));

    return ts.createMethod(
        undefined,      // decorators
        mods,           // modifiers
        undefined,      // asteriskToken
        doclet.name,    // name
        undefined,      // questionToken
        undefined,      // typeParameters
        params,         // parameters
        type,           // type
        undefined       // body
    );
}

export function createInterfaceMethod(doclet: IFunctionDoclet): ts.MethodSignature
{
    const mods: ts.Modifier[] = [];
    const params = createFunctionParams(doclet);
    const type = createFunctionReturnType(doclet);

    if (!doclet.memberof)
        mods.push(declareModifier);

    if (doclet.scope === 'static')
        mods.push(ts.createModifier(ts.SyntaxKind.StaticKeyword));

    return ts.createMethodSignature(
        undefined,      // typeParameters
        params,         // parameters
        type,           // type
        doclet.name,    // name
        undefined       // questionToken
    );
}

export function createInterface(doclet: IClassDoclet, children?: ts.Node[]): ts.InterfaceDeclaration
{
    const mods = doclet.memberof ? undefined : [declareModifier];

    // Validate that the children array actually contains type elements.
    // This should never trigger, but is here for safety.
    if (children)
    {
        for (let i = children.length - 1; i >= 0; --i)
        {
            const child = children[i];
            if (!ts.isTypeElement(child))
            {
                warn('Encountered child that is not a TypeElement, this is likely due to invalid JSDoc.', child);
                children.splice(i, 1);
            }
        }
    }

    const members = children as ts.TypeElement[];

    return ts.createInterfaceDeclaration(
        undefined,      // decorators
        mods,           // modifiers
        doclet.name,    // name
        undefined,      // typeParameters
        undefined,      // heritageClauses
        members         // members
    );
}

export function createEnum(doclet: IMemberDoclet): ts.EnumDeclaration
{
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

            props.push(ts.createEnumMember(p.name, undefined));
        }
    }

    return ts.createEnumDeclaration(
        undefined,
        mods,
        doclet.name,
        props,
    );
}

export function createClassMember(doclet: IMemberDoclet): ts.PropertyDeclaration
{
    const mods: ts.Modifier[] = [];
    const type = resolveType(doclet.type, doclet);

    if (doclet.kind === 'constant')
        mods.push(readonlyModifier);

    if (doclet.scope === 'static')
        mods.push(ts.createModifier(ts.SyntaxKind.StaticKeyword));

    return ts.createProperty(
        undefined,      // decorators
        mods,           // modifiers
        doclet.name,    // name
        undefined,      // questionToken
        type,           // type
        undefined       // initializer
    );
}

export function createInterfaceMember(doclet: IMemberDoclet): ts.PropertySignature
{
    const mods: ts.Modifier[] = [];
    const type = resolveType(doclet.type, doclet);

    if (doclet.kind === 'constant')
        mods.push(readonlyModifier);

    if (doclet.scope === 'static')
        mods.push(ts.createModifier(ts.SyntaxKind.StaticKeyword));

    return ts.createPropertySignature(
        mods,           // modifiers
        doclet.name,    // name
        undefined,      // questionToken
        type,           // type
        undefined       // initializer
    );
}

export function createModule(doclet: INamespaceDoclet, nested: boolean, children?: ts.Node[]): ts.ModuleDeclaration
{
    const mods = doclet.memberof ? undefined : [declareModifier];
    let body: ts.ModuleBlock | undefined = undefined;
    let flags = ts.NodeFlags.None;

    if (nested)
        flags |= ts.NodeFlags.NestedNamespace;

    // Validate that the children array actually contains declaration elements.
    // This should never trigger, but is here for safety.
    if (children)
    {
        for (let i = children.length - 1; i >= 0; --i)
        {
            const child = children[i];
            if (!ts.isClassDeclaration(child)
                && !ts.isInterfaceDeclaration(child)
                && !ts.isEnumDeclaration(child)
                && !ts.isModuleDeclaration(child)
                && !ts.isTypeAliasDeclaration(child))
            {
                warn('Encountered child that is not a supported declaration, this is likely due to invalid JSDoc.', child);
                children.splice(i, 1);
            }
        }

        body = ts.createModuleBlock(children as ts.Statement[]);
    }

    const name = ts.createIdentifier(doclet.name);

    return ts.createModuleDeclaration(
        undefined,      // decorators
        mods,           // modifiers
        name,           // name
        body,           // body
        flags           // flags
    );
}

export function createNamespace(doclet: INamespaceDoclet, nested: boolean, children?: ts.Node[]): ts.ModuleDeclaration
{
    const mods = doclet.memberof ? undefined : [declareModifier];
    let body: ts.ModuleBlock | undefined = undefined;
    let flags = ts.NodeFlags.Namespace;

    if (nested)
        flags |= ts.NodeFlags.NestedNamespace;

    // Validate that the children array actually contains declaration elements.
    // This should never trigger, but is here for safety.
    if (children)
    {
        for (let i = children.length - 1; i >= 0; --i)
        {
            const child = children[i];
            if (!ts.isClassDeclaration(child)
                && !ts.isInterfaceDeclaration(child)
                && !ts.isEnumDeclaration(child)
                && !ts.isModuleDeclaration(child)
                && !ts.isTypeAliasDeclaration(child))
            {
                warn('Encountered child that is not a supported declaration, this is likely due to invalid JSDoc.', child);
                children.splice(i, 1);
            }
        }

        body = ts.createModuleBlock(children as ts.Statement[]);
    }

    const name = ts.createIdentifier(doclet.name);

    return ts.createModuleDeclaration(
        undefined,      // decorators
        mods,           // modifiers
        name,           // name
        body,           // body
        flags           // flags
    );
}

export function createTypedef(doclet: ITypedefDoclet, children?: ts.Node[]): ts.TypeAliasDeclaration
{
    const mods = doclet.memberof ? undefined : [declareModifier];
    const type = resolveType(doclet.type, doclet);

    return ts.createTypeAliasDeclaration(
        undefined,      // decorators
        mods,           // modifiers
        doclet.name,    // name
        undefined,      // typeParameters
        type            // type
    );
}
