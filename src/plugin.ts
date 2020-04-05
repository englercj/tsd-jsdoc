
export function defineTags(dictionary: ITagDictionary) {
    dictionary.defineTag("template", {
        onTagged: function(doclet, tag) {
            doclet.tags = doclet.tags || [];
            doclet.tags.push(tag);
        }
    });
};
