export function defineTags(dictionary: ITagDictionary) {
    dictionary.defineTag("template", {
        onTagged: function(doclet, tag) {
            doclet.tags = doclet.tags || [];
            doclet.tags.push(tag);
        }
    });
};

const regexTypeOf = /typeof\s+([^\|\}]+)/g

export var handlers = {
    jsdocCommentFound: function(event: { filename?: string; comment?: string; lineno?: number; }) {
        let oldResult = "";
        let newResult = event.comment || "";
        while (newResult !== oldResult) {
            oldResult = newResult;
            newResult = newResult.replace(regexTypeOf, (typeExpression, className) => "Class<" + className + ">");
        }
        event.comment = newResult;
    }
};
