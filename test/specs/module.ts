import { tsdJsdocTestCase } from '../lib';

suite('Module Checks', () => {
		tsdJsdocTestCase('All', 'module_all');
		tsdJsdocTestCase('Quoted', 'module_quoted');
});
