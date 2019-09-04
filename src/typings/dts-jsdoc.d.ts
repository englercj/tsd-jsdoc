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
}
