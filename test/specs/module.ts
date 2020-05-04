import { expectJsDoc } from '../lib';

suite('Module Checks', () => {
    test('All', () => {
        expectJsDoc('module_all');
		});
		test('Quoted', () => {
			expectJsDoc('module_quoted');
	});
});
