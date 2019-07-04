declare interface ITemplateConfig {
    destination: string;
    outFile: string;
    private?: boolean;
    verbose?: boolean;
    access?: 'public' | 'private' | 'protected' | 'package';
}
