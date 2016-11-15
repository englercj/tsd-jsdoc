'use strict';

const env = require('jsdoc/env');
const fs = require('jsdoc/fs');
const helper = require('jsdoc/util/templateHelper');
const path = require('path');

const indentSize = 4;
let indentLevel = 0;
let ostream = null;

// to dedupe some objects (like getters/setters) that may appear twice.
const seenElements = {};

// queues up some typedefs until we can just write out the interface at the end
const interfaceQueue = [];

/**
 * @param {TAFFY} data - The TaffyDB containing the data that jsdoc parsed.
 * @param {object} opts - Options passed into jsdoc.
 */
module.exports.publish = function publishTsd(data, opts)
{
    // remove undocumented stuff.
    data({ undocumented: true }).remove();

    // remove private members if configured.
    if (opts.private === false)
    {
        data({ access: "private" }).remove();
    }

    const docs = data().get();

    if (opts.destination === 'console')
    {
        ostream = process.stdout;
    }
    else
    {
        fs.mkPath(opts.destination);

        const pkg = (helper.find(data, { kind: 'package' }) || [])[0];
        const out = path.join(opts.destination, pkg && pkg.name ? `${pkg.name}.d.ts` : 'types.d.ts');

        ostream = fs.createWriteStream(out);
    }

    parse(docs);

    while (interfaceQueue.length)
    {
        const element = interfaceQueue.pop();

        // comment
        writeComment(element.comment);

        writeInterfaceForObjectType(element);
    }

    ostream.end();
};

function parse(docs, parent)
{
    findChildrenOf(docs, (parent ? parent.longname : undefined)) // eslint-disable-line no-undefined
    .forEach((element) =>
    {
        if (element.ignore || seenElements[element.longname])
            return null;

        seenElements[element.longname] = true;

        switch (element.kind)
        {
            /* eslint-disable no-multi-spaces */
            case 'class':       return handleClass(docs, element, parent);
            case 'constant':    return handleMember(docs, element, parent);
            case 'function':    return handleFunction(docs, element, parent);
            case 'interface':   return handleClass(docs, element, parent, true);
            case 'member':      return handleMember(docs, element, parent);
            case 'mixin':       return handleClass(docs, element, parent);
            case 'module':      return handleNamespace(docs, element, parent);
            case 'namespace':   return handleNamespace(docs, element, parent);
            case 'typedef':     return handleTypedef(docs, element, parent);
            /* eslint-enable no-multi-spaces */
        }

        return null;
    });
}

function write(msg)
{
    if (!msg) return;

    ostream.write(msg);
}

function writeLn(msg)
{
    if (!msg) return;

    startLine();
    write(msg);
    endLine();
}

function writeComment(cmt)
{
    if (!cmt) return;

    cmt
        .split('\n')
        .map((v) => v.trim())
        .map((v) => (v.startsWith('*') ? ` ${v}` : v))
        .forEach(writeLn);
}

function startLine()
{
    const indent = (new Array(indentLevel * indentSize)).join(' ');

    write(indent);
}

function endLine()
{
    write('\n');
}

function indent()
{
    indentLevel++;
}

function unindent()
{
    indentLevel--;
}

function queueInterfaceForObjectType(element)
{
    interfaceQueue.push(element);
}

function writeInterfaceForObjectType(element)
{
    let prefix = env.conf.templates.jsdoc2tsd && env.conf.templates.jsdoc2tsd.interfacePrefix;

    if (!prefix)
        prefix = '';

    writeLn(`interface ${prefix}${element.name} {`);
    indent();

    for (let i = 0; i < element.properties.length; ++i)
    {
        const p = element.properties[i];

        writeLn(`${p.name}: ${getTypeName(p)};`);
    }

    unindent();
    writeLn('}');
    endLine();
}

function writeFunctionProto(element, isConstructor, isType)
{
    // params
    write('(');

    // `this` param
    // TODO: uncomment when using TS v2
    // if (element.this)
    // {
    //     write(`this: ${element.this}`);

    //     if (element.params && element.params.length)
    //         write(', ');
    // }

    if (element.params)
    {
        const params = {};

        // parse params first to combine property syntaxes
        for (let i = 0; i < element.params.length; ++i)
        {
            const p = element.params[i];
            const names = p.name.split('.');

            if (names.length === 1)
            {
                params[p.name] = p;
            }
            else
            {
                let c = params[names[0]];

                for (let j = 1; j < names.length - 1; ++j)
                {
                    const name = names[j];

                    if (!c.properties)
                        c.properties = {};

                    if (!c.properties[name])
                        c.properties[name] = {};

                    c = c.properties[name];
                }

                const name = names[names.length - 1];

                if (!c.properties)
                    c.properties = {};

                c.properties[name] = p;
                p.longname = p.name;
                p.name = name;
            }
        }

        // now output the params
        const keys = Object.keys(params);

        for (let i = 0; i < keys.length; ++i)
        {
            const p = params[keys[i]];

            const opt = typeof p.optional === 'boolean' ? p.optional : false;
            const nul = typeof p.nullable === 'boolean' ? p.nullable : false;

            let type = getTypeName(p);

            if (p.properties)
            {
                const objType = Object.keys(p.properties)
                    .reduce((prev, curr, i, a) =>
                    {
                        if (i === 0) prev += '{ ';

                        const v = p.properties[curr];

                        prev += `${v.name}: ${getTypeName(v)}`;

                        if (i !== a.length - 1)
                            prev += ', ';
                        else
                            prev += ' }';

                        return prev;
                    }, '');

                type = type.replace('Object', objType);
            }

            write(`${p.name}${opt || nul ? '?' : ''}: ${type}`);

            if (i !== keys.length - 1)
                write(', ');
        }
    }

    write(')');

    // return type
    if (!isConstructor)
    {
        write(isType ? ' => ' : ': ');

        if (element.returns && element.returns.length)
            write(`${getTypeName(element.returns[0])}`);
        else
            write('void');
    }

    // done
    write(';');
}

function getTypeName(obj)
{
    let name = 'any';

    if (obj.type)
    {
        if (obj.type.names.length === 1)
            name = obj.type.names[0];
        else
            name = `(${obj.type.names.join('|')})`;
    }

    name = name.trim();
    name = name.replace(/Array\.?<([^>]*)>/gi, '$1[]');
    name = name.replace(/Object\.?<([^,]*), ?([^>]*)>/gi, '{ [k: $1]: $2 }');
    name = name.replace(/\*|mixed/g, 'any');
    name = name.replace(/(^|[^\w])function(?:\(\))?([^\w]|$)/gi, '$1(() => any)$2');
    name = name.replace(/object/g, 'Object');

    return name;
}

function handleNamespace(docs, element/* , parent*/)
{
    // comment
    writeComment(element.comment);

    if (element.scope === 'global')
        write('declare ');

    // header
    writeLn(`module ${element.name} {`);

    // children
    handleChildren(docs, element);

    // done
    writeLn('}');
    endLine();
}

function handleFunction(docs, element, parent, isConstructor)
{
    const name = isConstructor ? 'constructor' : element.name;

    // skip if parent already defines it
    if (parent && parent.augments)
    {
        for (let i = 0; i < parent.augments.length; ++i)
        {
            const aug = parent.augments[i];
            const children = findChildrenOf(docs, aug);

            if (children.filter((v) => v.name === element.name).length)
                return;
        }
    }

    // comment
    writeComment(element.comment);

    startLine();

    let types = null;

    if (!isConstructor)
    {
        if (element.scope === 'global')
        {
            write('declare function ');
        }
        else if (isClass(parent))
        {
            // access
            if (element.access)
                write(`${element.access} `);

            // static
            if (element.scope === 'static')
                write('static ');
        }
        else
        {
            write('function ');
        }

        // templates
        types = templateTypes(element);
    }

    // name
    write(name);

    if (types !== null)
        write(`<${types.join(',')}>`);

    writeFunctionProto(element, isConstructor);
    endLine();
    endLine();
}

function handleMember(docs, element, parent)
{
    // generate an interface for this member
    if (isInterface(element))
        writeInterfaceForObjectType(element);

    // skip if parent already defines it
    if (parent && parent.augments)
    {
        for (let i = 0; i < parent.augments.length; ++i)
        {
            const aug = parent.augments[i];
            const children = findChildrenOf(docs, aug);

            if (children.filter((v) => v.name === element.name).length)
                return;
        }
    }

    // comment
    writeComment(element.comment);

    startLine();

    if (element.isEnum)
    {
        if (element.scope === 'global')
            write('declare ');

        write(`enum ${element.name} {`);
        endLine();

        indent();
        for (let i = 0; i < element.properties.length; ++i)
        {
            const p = element.properties[i];

            writeComment(p.comment);

            startLine();

            write(p.name);

            if (i !== element.properties.length - 1)
                write(',');

            endLine();
        }
        unindent();

        writeLn('}');
    }
    else
    {
        if (element.scope === 'global')
        {
            write('declare var ');
        }
        else
        {
            // member
            if (isClass(parent))
            {
                // access
                if (element.access)
                    write(`${element.access} `);

                // static
                if (element.scope === 'static')
                    write('static ');

                // TODO: Enable this when v2 is out.
                // readonly
                // if (element.readonly)
                //     write('readonly ');
            }
            // constant
            else if (element.kind === 'constant')
            {
                write('const ');
            }
            else
            {
                write('var ');
            }
        }

        write(`${element.name}: ${isInterface(element) ? `I${element.name}` : getTypeName(element)};`);
        endLine();
    }

    // extra newline
    endLine();
}

function handleClass(docs, element, parent, isInterface)
{
    // comment
    writeComment(element.comment);

    startLine();

    if (element.scope === 'global')
        write('declare ');
    // else
    // {
    //     if (element.access)
    //         write(`${element.access} `);
    // }

    // abstract
    if (element.virtual)
        write('abstract ');

    // templates
    let types = templateTypes(element);

    if (types !== null)
        types = `<${types.join(',')}>`;
    else
        types = '';

    // name
    write(`${isInterface ? 'interface' : 'class'} ${element.name}${types} `);

    // extends
    if (element.augments && element.augments.length)
    {
        const augs = element.augments.filter((v) => v.indexOf('module:') === -1);

        if (augs.length)
            write(`extends ${augs[0]} `);
    }

    // implements
    let impls = [];

    if (element.mixes) impls.push.apply(impls, element.mixes);
    if (element.implements) impls.push.apply(impls, element.implements);

    impls = impls.filter((v) => v.indexOf('module:') === -1);

    // TODO: If we have an implemented object, ensure all the properties are here.
    // If there are properties missing from this declaration that are in something
    // it implements TS will be upset. Need to iterate through properties of the
    // implemented classes and copy-paste properties that aren't here already.
    if (impls.length)
        write(`implements ${impls.join(', ')} `);

    // header end
    write('{');
    endLine();

    // constructor
    if (!isInterface && !element.virtual)
    {
        indent();
        handleFunction(docs, element, parent, true);
        unindent();
    }

    // children
    handleChildren(docs, element);

    // done
    writeLn('}');
    endLine();
}

function handleTypedef(docs, element, parent)
{
    const rawType = element.type && element.type.names.length === 1 && element.type.names[0];

    if (isInterface(element))
    {
        if (isClass(parent))
        {
            queueInterfaceForObjectType(element);
        }
        else
        {
            // comment
            writeComment(element.comment);

            writeInterfaceForObjectType(element);
        }
    }
    else
    {
        // comment
        writeComment(element.comment);

        startLine();

        // access
        if (element.access)
            write(`${element.access} `);

        // name
        write(`type ${element.name} = `);

        if (rawType === 'function')
            writeFunctionProto(element, false, true);
        else
            write(`${getTypeName(element)};`);

        endLine();
    }
    endLine();
}

function handleChildren(docs, element)
{
    indent();
    parse(docs, element);
    unindent();
}

function isClass(e)
{
    return e && (e.kind === 'class' || e.kind === 'interface' || e.kind === 'mixin');
}

function isInterface(e)
{
    return e && (e.kind === 'interface' || (getTypeName(e) === 'Object' && e.properties && e.properties.length));
}

/**
 * Returns the list of templates types of the given element or null.
 *
 * @param {JSON} e an element.
 * @returns {Array<string>} an array of the template types.
 */
function templateTypes(e)
{
    if (e.tags)
    {
        for (const tag of e.tags)
        {
            if (tag.title === 'template')
            {
                return tag.value.split(',').map(function trimmer(item)
                {
                    return item.trim();
                });
            }
        }
    }

    return null;
}

function findChildrenOf(docs, longname)
{
    return docs.filter((e) => e.memberof === longname);
}
