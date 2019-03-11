"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const traverse_1 = require("@babel/traverse");
const t = require("@babel/types");
const scriptToAST_1 = require("./scriptToAST");
const utils_1 = require("./utils");
(function (file) {
    const code = fs.readFileSync(file, 'utf-8');
    const ast = scriptToAST_1.default(code);
    debugger;
    const mainCommentArr = ast.comments.reduce((sofar, comment, index, arr) => {
        if (comment.type === 'CommentBlock' && arr.indexOf(sofar[sofar.length - 1]) + 1 === index) {
            return [...sofar, comment];
        }
        else {
            return sofar;
        }
    }, []);
    const comment = utils_1.getConcatedComments(mainCommentArr);
    const dependencies = [];
    let name;
    traverse_1.default(ast, {
        ImportDeclaration(path) {
            const source = path.node.source.value;
            const specifiers = path.node.specifiers.map(s => {
                return {
                    type: s.type,
                    name: s.local.name
                };
            });
            const comment = utils_1.getConcatedComments(path.node.leadingComments ? path.node.leadingComments.filter(comment => {
                return !mainCommentArr.includes(comment);
            }) : []);
            const dep = {
                source,
                specifiers,
                comment
            };
            dependencies.push(dep);
        },
        ExportDefaultDeclaration(rootPath) {
            const declaration = rootPath.node.declaration;
            const properties = declaration.properties;
            const nameNode = properties.find(node => t.isObjectProperty(node) && node.key.name === 'name');
            name = nameNode ? nameNode.value.value : null;
            const props = 1;
        }
    });
    const ci = {
        comment,
        name,
        dependencies
    };
    debugger;
    console.log(ci);
})(path.join(__dirname, '..', 'toRead.vue'));
