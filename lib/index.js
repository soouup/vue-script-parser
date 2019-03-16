"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const traverse_1 = require("@babel/traverse");
const t = require("@babel/types");
const scriptToAST_1 = require("./scriptToAST");
const getConcatedComments_1 = require("./helpers/getConcatedComments");
const nameReader_1 = require("./reader/nameReader");
const propsReader_1 = require("./reader/propsReader");
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
    const comment = getConcatedComments_1.default(mainCommentArr);
    const dependencies = [];
    let name;
    let props = [];
    traverse_1.default(ast, {
        ImportDeclaration(path) {
            const source = path.node.source.value;
            const specifiers = path.node.specifiers.map(s => {
                return {
                    type: s.type,
                    name: s.local.name
                };
            });
            const comment = getConcatedComments_1.default(path.node.leadingComments ? path.node.leadingComments.filter(comment => {
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
            function isVueOptionNameSetAsMethod(opName) {
                return ['data'].includes(opName);
            }
            function isVueOptionNameSetAsProperty(opName) {
                return ['name', 'props', 'computed', 'watch', 'methods'].includes(opName);
            }
            const nodeOfVueOptions = new Map();
            properties.forEach(pNode => {
                if (t.isObjectProperty(pNode) && isVueOptionNameSetAsProperty(pNode.key.name)) {
                    nodeOfVueOptions.set(pNode.key.name, pNode);
                }
                else if (t.isObjectMethod(pNode) && isVueOptionNameSetAsMethod(pNode.key.name)) {
                    nodeOfVueOptions.set(pNode.key.name, pNode);
                }
            });
            name = nameReader_1.default(nodeOfVueOptions);
            props = propsReader_1.default(nodeOfVueOptions);
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
