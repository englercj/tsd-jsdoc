import { expectJsDoc } from '../lib';

suite('Module Checks', () => {
    test('All', () => {
        expectJsDoc('module');
        expectJsDoc('module2');
    });
});
