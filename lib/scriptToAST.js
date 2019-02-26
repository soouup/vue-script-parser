"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vue_template_compiler_1 = require("vue-template-compiler");
const parser_1 = require("@babel/parser");
function scriptToAST(code) {
    const sfc = vue_template_compiler_1.parseComponent(code);
    const ast = parser_1.parse(sfc.script.content, {
        sourceType: "module",
        plugins: [
            'dynamicImport',
            'jsx'
        ]
    });
    return ast;
}
exports.default = scriptToAST;
