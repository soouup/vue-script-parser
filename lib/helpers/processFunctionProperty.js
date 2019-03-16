"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("@babel/types");
const generator_1 = require("@babel/generator");
function processFunctionProperty(funcNode) {
    if (t.isObjectProperty(funcNode)) {
        if (!t.isFunctionExpression(funcNode.value) && !t.isArrowFunctionExpression(funcNode.value)) {
            console.warn('not a function expression node');
            return {
                code: '',
                use: []
            };
        }
        return {
            code: generator_1.default(funcNode.value).code,
            use: []
        };
    }
    else {
        return {
            code: generator_1.default(funcNode).code,
            use: []
        };
    }
}
exports.default = processFunctionProperty;
