import { expectJsDoc } from '../lib';

suite('Exports Checks', () => {
    class ExportTest {
        public readonly id: string;
        public readonly desc: string;
        public constructor(id: string, desc: string) {
            this.id = id;
            this.desc = desc;
        }
    }
    const exportTests : Array<ExportTest> = [
        // Default export by reference.
        {id: "export default ref",                      desc: "'export default' keywords with reference to an existing type"},
        {id: "module.exports=ref",                      desc: "'module.exports =' default export pattern with reference to an existing type"},
        // Named exports.
        {id: "module.exports.name=ref",                 desc: "'module.exports.name =' named export pattern with reference to an existing type"},
        {id: "exports.name=ref",                        desc: "'exports.name =' named export pattern with reference to an existing type"},
        {id: "module.exports={name=ref}",               desc: "'module.exports = { name: ...}' named export pattern with references to existing types"},
        // Mixs.
        {id: "exports=module.exports=",                 desc: "'exports = module.exports =' pattern"},
        {id: "mix-default-named",                       desc: "Mix of default and named exports"},
        // Inline named types.
        // Not supported yet: {id: "export default named-class",              desc: "'export default' with named class inline"},
        // Not supported yet: {id: "export default named-function",           desc: "'export default' with named function inline"},
        // Not supported yet: {id: "module.exports=named-class",              desc: "'module.exports =' default export pattern with named class inline"},
        // Not supported yet: {id: "module.exports=named-function",           desc: "'module.exports =' default export pattern with named function inline"},
        // Not supported yet: {id: "export named-types",                      desc: "'export' keyword"},
        // Not supported yet: {id: "module.exports.name=named-class",         desc: "'module.exports.name =' named export pattern with named class inline"},
        // Not supported yet: {id: "module.exports.name=named-function",      desc: "'module.exports.name =' named export pattern with named function inline"},
        // Not supported yet: {id: "exports.name=named-class",                desc: "'exports.name =' named export pattern with named class inline"},
        // Not supported yet: {id: "exports.name=named-function",             desc: "'exports.name =' named export pattern with named function inline"},
        // Not supported yet: {id: "module.exports={name=named-class}",       desc: "'module.exports = { name: ...}' named export pattern with named class inline"},
        // Not supported yet: {id: "module.exports={name=named-function}",    desc: "'module.exports = { name: ...}' named export pattern with named class inline"},
        // Lambdas.
        // Not supported yet: {id: "export default lambda-class",             desc: "'export default' with lambda class"},
        // Not supported yet: {id: "export default lambda-function",          desc: "'export default' with lambda function"},
        // Not supported yet: {id: "module.exports=lambda-class",             desc: "'module.exports =' default export pattern with lambda class"},
        // Not supported yet: {id: "module.exports=lambda-function",          desc: "'module.exports =' default export pattern with lambda function"},
        // Not supported yet: {id: "module.exports.name=lambda-class",        desc: "'module.exports.name =' named export pattern with lambda class"},
        // Not supported yet: {id: "module.exports.name=lambda-function",     desc: "'module.exports.name =' named export pattern with lambda function"},
        // Not supported yet: {id: "exports.name=lambda-class",               desc: "'exports.name =' named export pattern with lambda class"},
        // Not supported yet: {id: "exports.name=lambda-function",            desc: "'exports.name =' named export pattern with lambda function"},
        // Not supported yet: {id: "module.exports={name=lambda-class}",      desc: "'module.exports = { name: ...}' named export pattern with lambda class"},
        // Not supported yet: {id: "module.exports={name=lambda-function}",   desc: "'module.exports = { name: ...}' named export pattern with lambda class"},
        // Border cases.
        // To be fixed: {id: "indirect(=module.exports).name=",         desc: "Named export through an indirection"},
        // Not supported: {id: "wrong exports.name=",                     desc: "Wrong use of 'exports.name =' while not set to module.exports"},
    ];
    // Execute the tests.
    let maxIdLen = 0;
    for (const exportTest of exportTests) {
        if (exportTest.id.length > maxIdLen) {
            maxIdLen = exportTest.id.length;
        }
    }
    for (const exportTest of exportTests) {
        test(`[${exportTest.id}]${" ".repeat(maxIdLen - exportTest.id.length)} ${exportTest.desc}`, () => {
            expectJsDoc(`exports_${exportTest.id}`);
        });
    }
});
