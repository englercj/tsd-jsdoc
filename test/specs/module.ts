import { expectJsDoc } from '../lib';

suite('Module Annotation Checks', () => {
    test('All', () => {
        expectJsDoc('module');
    });
});
