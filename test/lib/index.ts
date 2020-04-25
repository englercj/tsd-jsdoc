// tslint:disable-next-line
/// <reference path="../typings/walk-back.d.ts" />

import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
// See: https://github.com/Alexis-ROYER/tsd-default-export/blob/master/README.md
// Use ES6 default import.
import walkBack from 'walk-back';
import { JsdocApi } from './jsdoc-api';
import { renderSync } from './render';

// jsdoc-api may actually work with a jsdoc instance installed in its own `node_modules` subdirectory.
// Use the same kind of 'walk-back' call as jsdoc-api does in order to find the jsdoc instance actually used.
const jsdocPath = walkBack(
    path.join(__dirname, '../../node_modules/jsdoc-api'),
    path.join('node_modules', 'jsdoc')
);
const jsdocInfo = require(path.join(jsdocPath || '../../node_modules/jsdoc', 'package'));

const DEST_DIR = path.resolve(path.join(__dirname, '../_temp'));
const DATA_DIR = path.resolve(path.join(__dirname, '../fixtures'));
const EXPECT_DIR = path.resolve(path.join(__dirname, '../expected'));
const CONFIG_PATH = path.resolve(path.join(__dirname, '../../jsdoc-conf.json'));

before(() => {
    // create the temp dir to store types in
    try {
        fs.mkdirSync(DEST_DIR);
    } catch (e) { /* Do Nothing */ }
});

function explainJsdoc(sourcePath: string): string {
    // Create a jsdoc configuration file.
    let jsdocConf = JSON.parse(JSON.stringify(require(CONFIG_PATH))); // <= Ensure we modify a clone object.
    if (jsdocConf.opts && jsdocConf.opts.template)
        // Remove the tsd-jsdoc template.
        delete jsdocConf.opts.template;
    const confPath = path.join(DEST_DIR, path.basename(sourcePath).replace(".js", `-conf-explain.json`));
    fs.writeFileSync(confPath, JSON.stringify(jsdocConf, null, 2));

    // Call the `JsdocApi.explainSync()` function.
    const rawDestPath = path.join(DEST_DIR, path.basename(sourcePath).replace(".js", `-jsdoc@${jsdocInfo.version}-explain.json`));
    const jsdocRawOutput = JsdocApi.explainSync({
        files: sourcePath,
        cache: false,
        configure: confPath
    });
    fs.writeFileSync(
        rawDestPath,
        JSON.stringify(jsdocRawOutput, null, 2)
    );

    // Eventually return the path of the raw output file.
    return rawDestPath;
}

function compileJsdoc(sourcePath: string, generationStrategy: 'documented' | 'exported'): string {
    // Create a jsdoc configuration file.
    let jsdocConf = JSON.parse(JSON.stringify(require(CONFIG_PATH))); // <= Ensure we modify a clone object.
    if (! jsdocConf.opts)
        jsdocConf.opts = {}
    jsdocConf.opts.generationStrategyr = generationStrategy
    const confPath = path.join(DEST_DIR, path.basename(sourcePath).replace(".js", `-conf-${generationStrategy}.json`));
    fs.writeFileSync(confPath, JSON.stringify(jsdocConf, null, 2));

    // Launch jsdoc with the tsd-jsdoc template.
    renderSync({
        files: sourcePath,
        cache: false,
        destination: DEST_DIR,
        configure: confPath
    });
    // Rename the `types.d.ts` output file into a `<basepart>-jsdoc@<jsdoc-version>-<generation-strategy>.d.ts` file,
    // <basepart> being inspired from the `sourcePath` parameter.
    // The <jsdoc-version> tag in the file name helps investigations when something fails between jsdoc@3.5.x vs jsdoc@3.6.x.
    // The <generation-strategy> tag in the file name helps investigations when something fails between 'documented' vs 'exported' generation strategies.
    const destPath = path.join(DEST_DIR, path.basename(sourcePath).replace(".js", `-jsdoc@${jsdocInfo.version}-${generationStrategy}.d.ts`));
    fs.renameSync(
        path.join(DEST_DIR, `types.d.ts`),
        destPath
    );

    // Eventually return the path of the output file.
    return destPath;
}

function expectJsDoc(fileName: string, generationStrategy: 'documented' | 'exported') {
    const dataPath = path.join(DATA_DIR, `${fileName}.js`);

    // Let's first export the jsdoc raw output in a file tagged with the jsdoc version,
    // in order to help investigations when somethings fails between jsdoc@3.5.x vs jsdoc@3.6.x.
    explainJsdoc(dataPath);

    // Execute tsd-jsdoc.
    const destPath = compileJsdoc(dataPath, generationStrategy);
    const destStr = fs.readFileSync(destPath, 'utf8');

    // Check result.
    const expectPath = path.join(EXPECT_DIR, `${fileName}.d.ts`);
    const expectStr = fs.readFileSync(expectPath, 'utf8');
    expect(destStr.trim()).to.equal(expectStr.trim());
}

/**
 * Defines two tests for each test case: one for 'documented', the other for 'exported' generation strategy.
 * This function is the only exported symbol for this file, so that every test case pass through it and be declined in its 'documented' and 'exported' versions.
 * @param testName Name of the test.
 * @param basename Fixture file base name.
 */
export function tsdJsdocTestCase(testName: string, basename: string, description?: string) {
    test(
        testName + ' '.repeat(40-testName.length) + '\'documented\' generation strategy     ' + (description ? description : ''),
        function() {
            expectJsDoc(basename, 'documented');
        }
    );
    test(
        testName + ' '.repeat(40-testName.length) + '\'exported\' generation strategy       ' + (description ? description : ''),
        function() {
            expectJsDoc(basename, 'exported');
        }
    );
}
