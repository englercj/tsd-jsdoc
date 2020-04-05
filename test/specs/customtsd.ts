import { expectJsDoc } from '../lib';

suite('Custom TSD Checks', () => {
    test('All', () => {
        expectJsDoc('customtsd_all');
    });
});
