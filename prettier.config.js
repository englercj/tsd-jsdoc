/**
 * @type {import('prettier').Options}
 */
module.exports = {
    /*
     * Requiring trailing commas makes git history work better. If you have an
     * object:
     * {
     *   a: 1,
     *   b: 2
     * }
     * and then add a property after 'b':
     * {
     *   a: 1,
     *   b: 2,
     *   c: 3
     * }
     * the line with 'b' gets changed (it now requires a comma) even though
     * there's no real meaningful change to it.
     *
     * When using the `git blame` command, git looks at line by line changes.
     * These comma only changes make it more difficult to follow history.
     */
    trailingComma: 'all',
    // for consistency with previous code format
    singleQuote: true,
    tabWidth: 4,
    printWidth: 100,
    overrides: [
        // Taken from editorconfig
        {
            files: '{package.json,bower.json,**/*.yml,.*.yml}',
            options: {
                tabWidth: 2,
            },
        },
        // for consistency with previous code format
        {
            files: '**/*.md',
            options: {
                tabWidth: 2,
            },
        },
    ],
};
