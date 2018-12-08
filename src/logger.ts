const header = '[TSD-JSDoc]';

export function warn(msg: string, data?: any)
{
    if (typeof(console) === 'undefined')
        return;

    console.warn(`${header} ${msg}`);

    if (data)
    {
        const dataStr = JSON.stringify(data, null, 4);
        console.warn(`${header} ${dataStr}`);
    }
}
