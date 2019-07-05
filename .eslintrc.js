/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        curly: ['warn', 'all'],
    },
};
