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
