import * as path from 'path';
import * as fs from 'fs';
import * as helper from 'jsdoc/util/templateHelper';
import { Emitter } from './Emitter';
import { setVerbose } from './logger';

/**
 * @param {TAFFY} data - The TaffyDB containing the data that jsdoc parsed.
 * @param {*} opts - Options passed into jsdoc.
 */
export function publish(data: TDocletDb, opts: ITemplateConfig)
{
    // remove undocumented stuff.
    data({ undocumented: true }).remove();

    // get the doc list
    const docs = data().get();

    setVerbose(!!opts.verbose);

    // create an emitter to parse the docs
    const emitter = new Emitter(!!opts.private);
    emitter.parse(docs);

    // emit the output
    if (opts.destination === 'console')
    {
        console.log(emitter.emit());
    }
    else
    {
        try
        {
            fs.mkdirSync(opts.destination);
        }
        catch (e)
        {
            if (e.code !== 'EEXIST')
            {
                throw e;
            }
        }

        const pkgArray: any = helper.find(data, { kind: 'package' }) || [];
        const pkg = pkgArray[0] as IPackageDoclet;
        const out = path.join(opts.destination, opts.outFile || pkg && pkg.name ? `${pkg.name}.d.ts` : 'types.d.ts');

        fs.writeFileSync(out, emitter.emit());
    }
}
