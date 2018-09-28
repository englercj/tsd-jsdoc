import * as path from 'path';
import * as fs from 'fs';
import * as env from 'jsdoc/env'; // tslint:disable-line
import * as helper from 'jsdoc/util/templateHelper'; // tslint:disable-line
import Emitter from './Emitter';

/**
 * @param {TAFFY} data - The TaffyDB containing the data that jsdoc parsed.
 * @param {*} opts - Options passed into jsdoc.
 */
export function publish(data: TDocletDb, opts: ITemplateConfig) {
    // remove undocumented stuff.
    data({ undocumented: true }).remove();

    // get the doc list
    const docs = data().get();

    // create an emitter to parse the docs
    const emitter = new Emitter(docs, opts);

    // emit the output
    if (opts.destination === 'console') {
        console.log(emitter.emit());
    }
    else {
        try {
            fs.mkdirSync(opts.destination);
        }
        catch (e) {
            if (e.code !== 'EEXIST') {
                throw e;
            }
        }

        let pkgName = env.conf.templates && env.conf.templates.jsdoc2tsd && env.conf.templates.jsdoc2tsd.name;
        if (!pkgName) {
            const pkgArray: any = helper.find(data, { kind: 'package' }) || [];
            const pkg = pkgArray[0] as IPackageDoclet;
            pkgName = pkg && pkg.name ? `${pkg.name}.d.ts` : 'types.d.ts';
        }
        const out = path.join(opts.destination, pkgName);

        fs.writeFileSync(out, emitter.emit());
    }
}
