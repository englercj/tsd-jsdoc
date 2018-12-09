const header = '[TSD-JSDoc]';

export function warn(msg: string, data?: any)
{
    if (typeof(console) === 'undefined')
        return;

    console.warn(`${header} ${msg}`);

    if (arguments.length > 1)
    {
        const dataStr = JSON.stringify(data, null, 4);
        console.warn(`${header} ${dataStr}`);
    }
}
