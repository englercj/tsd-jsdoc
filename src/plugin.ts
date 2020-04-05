
export function defineTags(dictionary: ITagDictionary) {
    dictionary.defineTag("template", {
        onTagged: function(doclet, tag) {
            doclet.tags = doclet.tags || [];
            doclet.tags.push(tag);
        }
    });
    dictionary.defineTag("customtsd", {
        keepsWhitespace: true,
        removesIndent: true,
        mustHaveValue: true,
        onTagged: function(doclet, tag) {
            doclet.kind = "customtsd";
            doclet.name = "customtsd";
            doclet.tags = doclet.tags || [];
            doclet.tags.push(tag);
        }
    });
};
