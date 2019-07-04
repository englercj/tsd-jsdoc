// tslint:disable-next-line
/// <reference path="../typings/jsdoc-api.d.ts" />

import * as fs from 'fs';
import * as path from 'path';
import * as jsdocApi from 'jsdoc-api';
import { expect } from 'chai';

const DEST_DIR = path.resolve(path.join(__dirname, '../_temp'));
const DATA_DIR = path.resolve(path.join(__dirname, '../fixtures'));
const EXPECT_DIR = path.resolve(path.join(__dirname, '../expected'));
const README_PATH = path.resolve(path.join(__dirname, '../../README.md'));
const TEMPLATE_PATH = path.resolve(path.join(__dirname, '../../dist'));

before(() => {
    // create the temp dir to store types in
    try {
        fs.mkdirSync(DEST_DIR);
    } catch (e) {
        /* Do Nothing */
    }
});

export function compileJsdoc(sourcePath: string) {
    jsdocApi.renderSync({
        files: sourcePath,
        cache: false,
        destination: DEST_DIR,
        readme: README_PATH,
        template: TEMPLATE_PATH,
    } as any);
}

export function expectJsDoc(fileName: string) {
    const destPath = path.join(DEST_DIR, `types.d.ts`);
    const dataPath = path.join(DATA_DIR, `${fileName}.js`);
    const expectPath = path.join(EXPECT_DIR, `${fileName}.d.ts`);

    compileJsdoc(dataPath);

    const destStr = fs.readFileSync(destPath, 'utf8');
    const expectStr = fs.readFileSync(expectPath, 'utf8');

    expect(destStr.trim()).to.equal(expectStr.trim());
}
