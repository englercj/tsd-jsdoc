import { tsdJsdocTestCase } from '../lib';

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
        {id: "module.exports.name=ref-same-name",       desc: "'module.exports.name =' named export pattern with reference to an existing type with the same same"},
        {id: "module.exports.name=ref-other-name",      desc: "'module.exports.name =' named export pattern with reference to an existing type with a different name"},
        {id: "exports.name=ref-same-name",              desc: "'exports.name =' named export pattern with reference to an existing type with the same name"},
        {id: "exports.name=ref-other-name",             desc: "'exports.name =' named export pattern with reference to an existing type with a different name"},
        // Not supported yet: {id: "export default {name=ref-same-name}",     desc: "'export default { name: ... }' named export pattern with references to existing types with same names"},
        // Not supported yet: {id: "export default {name=ref-other-name}",    desc: "'export default { name: ... }' named export pattern with references to existing types with different names"},
        {id: "module.exports={name=ref-same-name}",     desc: "'module.exports = { name: ... }' named export pattern with references to existing types with same names"},
        {id: "module.exports={name=ref-other-name}",    desc: "'module.exports = { name: ... }' named export pattern with references to existing types with different names"},
        // Inline named types.
        {id: "export default named-class",              desc: "'export default' with named class inline"},
        {id: "export default named-function",           desc: "'export default' with named function inline"},
        {id: "module.exports=named-class",              desc: "'module.exports =' default export pattern with named class inline"},
        {id: "module.exports=named-function",           desc: "'module.exports =' default export pattern with named function inline"},
        {id: "export named-types",                      desc: "'export' keyword before a named type"},
        {id: "module.exports.name=named-class",         desc: "'module.exports.name =' named export pattern with named class inline"},
        {id: "module.exports.name=named-function",      desc: "'module.exports.name =' named export pattern with named function inline"},
        {id: "exports.name=named-class",                desc: "'exports.name =' named export pattern with named class inline"},
        {id: "exports.name=named-function",             desc: "'exports.name =' named export pattern with named function inline"},
        // Not supported yet: {id: "export default {name=named-class}",       desc: "'export default { name: ...}' named export pattern with named class inline"},
        // Not supported yet: {id: "export default {name=named-function}",    desc: "'export default { name: ...}' named export pattern with named function inline"},
        {id: "module.exports={name=named-class}",       desc: "'module.exports = { name: ... }' named export pattern with named class inline"},
        {id: "module.exports={name=named-function}",    desc: "'module.exports = { name: ... }' named export pattern with named function inline"},
        // Lambdas.
        {id: "export default lambda-class",             desc: "'export default' with lambda class"},
        {id: "export default lambda-function",          desc: "'export default' with lambda function"},
        {id: "module.exports=lambda-class",             desc: "'module.exports =' default export pattern with lambda class"},
        {id: "module.exports=lambda-function",          desc: "'module.exports =' default export pattern with lambda function"},
        {id: "module.exports.name=lambda-class",        desc: "'module.exports.name =' named export pattern with lambda class"},
        {id: "module.exports.name=lambda-function",     desc: "'module.exports.name =' named export pattern with lambda function"},
        {id: "exports.name=lambda-class",               desc: "'exports.name =' named export pattern with lambda class"},
        {id: "exports.name=lambda-function",            desc: "'exports.name =' named export pattern with lambda function"},
        {id: "module.exports={name=lambda-class}",      desc: "'module.exports = { name: ... }' named export pattern with lambda class"},
        {id: "module.exports={name=lambda-function}",   desc: "'module.exports = { name: ... }' named export pattern with lambda function"},
        // Mixs.
        {id: "exports=module.exports=",                 desc: "'exports = module.exports =' pattern"},
        {id: "mix-default-named",                       desc: "Mix of default and named exports"},
        // Border cases.
        {id: "cyclic-dependencies",                     desc: "Check no infinite loop on cyclic dependencies"},
        // To be fixed: {id: "indirect(=module.exports).name=",         desc: "Named export through an indirection"},
        // Not supported: {id: "wrong exports.name=",                     desc: "Wrong use of 'exports.name =' while not set to module.exports"},
    ];
    // Execute the tests.
    for (const exportTest of exportTests) {
        tsdJsdocTestCase(exportTest.id, `exports_${exportTest.id}`, exportTest.desc);
    }
});
