const header = '[TSD-JSDoc]';

let isVerbose = false;

export function setVerbose(value: boolean)
{
    isVerbose = value;
}

export function warn(msg: string, data?: any)
{
    if (typeof(console) === 'undefined')
        return;

    console.warn(`${header} ${msg}`);

    if (isVerbose && arguments.length > 1)
    {
        console.warn(data);
    }
}

let isDebug = false;

export function setDebug(value: boolean)
{
    isDebug = value;
}

export function debug(msg: string, data?: any)
{
    if (typeof(console) === 'undefined')
        return;

    if (isDebug)
    {
        // Mix of tsd-jsdoc header with the jsdoc pattern on 'debug' option activated.
        console.log(`${header} DEBUG: ${msg}`);
        if (arguments.length > 1)
        {
            console.log(data);
        }
    }
}

export function docletDebugInfo(doclet: TAnyDoclet) : string {
    let debugInfo = `{longname='${doclet.longname}', kind='${doclet.kind}'`;
    if ((doclet.kind !== 'package') && doclet.meta)
    {
        if (doclet.meta.code.id)
        {
            debugInfo += `, id='${doclet.meta.code.id}'`;
        }
        if (doclet.meta.range)
        {
            debugInfo += `, range=[${doclet.meta.range[0]}-${doclet.meta.range[1]}]`;
        }
    }
    debugInfo += `}`;
    return debugInfo;
}
