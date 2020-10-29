declare interface ITemplateConfig {
    destination: string;
    outFile: string;
    private?: boolean;
    /**
     * Activate warning traces.
     */
    verbose?: boolean;
    /**
     * Activate debug traces.
     */
    debug?: boolean;
    access?: ("public" | "private" | "protected" | "package");
    /**
     * See [tsd-jsdoc#100](https://github.com/englercj/tsd-jsdoc/issues/100).
     * The 'exported' generation strategy is activated through an option.
     * In order not to break backward compatibility, the 'documented' generation strategy remains the default.
     */
    generationStrategy?: ("documented" | "exported");
    strictDocumentation?: boolean;
}
