import * as path from 'path';
import * as fs from 'fs';
import * as helper from 'jsdoc/util/templateHelper';
import { Emitter } from './Emitter';
import { setVerbose, setDebug, debug, docletDebugInfo } from './logger';

/**
 * @param {TAFFY} data - The TaffyDB containing the data that jsdoc parsed.
 * @param {*} opts - Options passed into jsdoc.
 */
export function publish(data: TDocletDb, opts: ITemplateConfig)
{
    // start with taking into account 'verbose' and 'debug' options
    setVerbose(!!opts.verbose);
    setDebug(!!opts.debug);

    // in order not to break backward compatibility, the 'documented' generation strategy is used by default
    if (! opts.generationStrategy)
    {
        opts.generationStrategy = 'documented';
    }
    debug(`publish(): Generation strategy: '${opts.generationStrategy}'`);

    // do not remove undocumented doclet with the 'exported' generation strategy
    // the Emitter._walkExportedDoclets() function will make the appropriate selection later
    if (opts.generationStrategy !== 'exported')
    {
        // remove undocumented stuff.
        data(
            // use of a function as the TaffyDB query in order to track what is removed
            // see [TaffyDB documentation](http://taffydb.com/writing_queries.html)
            function(this: TDoclet) // <= 'this' type declaration inspired from [stackoverflow](https://stackoverflow.com/questions/41944650)
            {
                if (this.undocumented)
                {
                    debug(`publish(): ${docletDebugInfo(this)} removed`);
                }
                return false;
            }
        ).remove();
    }

    // get the doc list
    const docs = data().get();

    // create an emitter to parse the docs
    const emitter = new Emitter(opts);
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
        let definitionName: string = 'types';
        if (pkg && pkg.name) {
          definitionName = pkg.name.split('/').pop() || definitionName;
        }
        const out = path.join(opts.destination, opts.outFile || `${definitionName}.d.ts`);

        fs.writeFileSync(out, emitter.emit());
    }
}
