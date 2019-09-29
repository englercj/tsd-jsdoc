// tslint:disable-next-line
/// <reference path="../typings/jsdoc-api.d.ts" />

import * as fs from 'fs';
import * as path from 'path';
import * as jsdocApi from 'jsdoc-api';
import { expect } from 'chai';
// jsdoc-api may actually work with a jsdoc instance installed in its own `node_modules` subdirectory.
// Use the same kind of 'walk-back' call as jsdoc-api does in order to find the jsdoc instance actually used.
const walkBack = require('walk-back');
const jsdocPath = walkBack(
  path.join(__dirname, '../../node_modules/jsdoc-api'),
  path.join('node_modules', 'jsdoc')
);
const jsdocInfo = require(path.join(jsdocPath || '../../node_modules/jsdoc', 'package'));

const DEST_DIR = path.resolve(path.join(__dirname, '../_temp'));
const DATA_DIR = path.resolve(path.join(__dirname, '../fixtures'));
const EXPECT_DIR = path.resolve(path.join(__dirname, '../expected'));
const README_PATH = path.resolve(path.join(__dirname, '../../README.md'));
const TEMPLATE_PATH = path.resolve(path.join(__dirname, '../../dist'));

before(() => {
    // create the temp dir to store types in
    try {
        fs.mkdirSync(DEST_DIR);
    } catch (e) { /* Do Nothing */ }
});

function compileJsdoc(sourcePath: string, generationStrategy: 'documented' | 'exported'): string {
    // Let's first export the jsdoc raw output in a file tagged with the jsdoc version,
    // in order to help investigations when somethings fails between jsdoc@3.5.x vs jsdoc@3.6.x.
    const jsdocRawOutput = jsdocApi.explainSync({
        files: sourcePath,
        cache: false
    });
    const rawDestPath = path.join(DEST_DIR, path.basename(sourcePath).replace(".js", `-jsdoc@${jsdocInfo.version}-explain.json`));
    fs.writeFileSync(
        rawDestPath,
        JSON.stringify(jsdocRawOutput, null, 2)
    );

    // Create a jsdoc configuration file.
    const confPath = path.join(DEST_DIR, path.basename(sourcePath).replace(".js", `-conf-${generationStrategy}.json`));
    fs.writeFileSync(confPath, JSON.stringify({
        opts: {
            generationStrategy: generationStrategy
        }
    }));
    // Launch jsdoc with the tsd-jsdoc template.
    jsdocApi.renderSync({
        files: sourcePath,
        cache: false,
        destination: DEST_DIR,
        readme: README_PATH,
        template: TEMPLATE_PATH,
        configure: confPath
    } as any);
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

    const destPath = compileJsdoc(dataPath, generationStrategy);
    const destStr = fs.readFileSync(destPath, 'utf8');

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
export function tsdJsdocTestCase(testName: string, basename: string) {
    test('\'documented\' generation strategy - ' + testName, function() {
        expectJsDoc(basename, 'documented');
    });
    test('\'generated\' generation strategy  - ' + testName, function() {
        expectJsDoc(basename, 'exported');
    });
}
