"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const scriptToAST_1 = require("./scriptToAST");
const traverse_1 = require("@babel/traverse");
const path = require("path");
(function (file) {
    const code = fs.readFileSync(file, 'utf-8');
    const ast = scriptToAST_1.default(code);
    debugger;
    const dependencies = [];
    traverse_1.default(ast, {
        ImportDeclaration(path) {
            const source = path.node.source.value;
            const specifiers = path.node.specifiers.map(s => {
                return {
                    type: s.type,
                    name: s.local.name
                };
            });
            const dep = {
                source,
                specifiers,
                comment: ''
            };
            dependencies.push(dep);
        }
    });
    const ci = {
        comment: '',
        name: '',
        dependencies
    };
    debugger;
    console.log(ci);
})(path.join(__dirname, '..', 'toRead.vue'));
