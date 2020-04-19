import Cache from 'cache-point';
import FileSet from 'file-set';

export namespace JsdocApi {
    function explain(options: JsdocOptions): Promise<any[]>;
    function explainSync(options: JsdocOptions): any[];
    function renderSync(options: JsdocOptions): void;
}

export interface JsdocOptions {
    /** One or more filenames to process. Either this or `source` must be supplied. */
    files?: string|string[];
    /** A string containing source code to process. Either this or `source` must be supplied. */
    source?: string;
    /** Set to `true` to cache the output - future invocations with the same input will return immediately. */
    cache?: boolean;
    /** Only display symbols with the given access: "public", "protected", "private" or "undefined", or "all" for all access levels. Default: all except "private". */
    access?: string;
    /** The path to the configuration file. Default: path/to/jsdoc/conf.json. */
    configure?: string;
    /** The path to the output folder. Use "console" to dump data to the console. Default: ./out/. */
    destination?: string;
    /** Assume this encoding when reading all source files. Default: utf8. */
    encoding?: string;
    /** Display symbols marked with the `@private` tag. Equivalent to "--access all". Default: false. */
    private?: boolean;
    /** The path to the project's package file. Default: path/to/sourcefiles/package.json */
    package?: string;
    /** Treat errors as fatal errors, and treat warnings as errors. Default: false. */
    pedantic?: boolean;
    /** A query string to parse and store in jsdoc.env.opts.query. Example: foo=bar&baz=true. */
    query?: string;
    /** Recurse into subdirectories when scanning for source files and tutorials. */
    recurse?: boolean;
    /** The path to the project's README file. Default: path/to/sourcefiles/README.md. */
    readme?: string;
    /** The path to the template to use. Default: path/to/jsdoc/templates/default. */
    template?: string;
    /** Directory in which JSDoc should search for tutorials. */
    tutorials?: string;
}

export class TempFile {
    path: string;
}

/**
 * Command base class. The command `receiver` being the `child_process` module.
 */
export abstract class JsdocCommand {
    cache?: Cache;
    tempFile: TempFile | null;
    options: JsdocOptions;
    jsdocOptions: JsdocOptions;
    jsdocPath: string;
    inputFileSet?: FileSet;
    output?: any;

    constructor (options: JsdocOptions, cache?: Cache);

    abstract getOutput(): any;

    /**
     * Template method returning the jsdoc output. Invoke later (for example via a command-queuing system) or immediately as required.
     *
     * 1. preExecute
     * 2. validate
     * 3. getOutput
     * 4. postExecute
     *
     */
    execute(): any;

    /**
     * Perform pre-execution processing here, e.g. expand input glob patterns.
     */
    preExecute(): void;

    /**
     * Return an Error instance if execution should not proceed.
     */
    validate(): null | Error;

    /**
     * perform post-execution cleanup
     */
    postExecute(): void;
}
