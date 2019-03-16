"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("@babel/types");
const generator_1 = require("@babel/generator");
const getConcatedComments_1 = require("../helpers/getConcatedComments");
const processFunctionProperty_1 = require("../helpers/processFunctionProperty");
function default_1(nodeOfVueOptions) {
    const node = nodeOfVueOptions.get('props');
    if (node) {
        if (t.isArrayExpression(node.value)) {
            const elements = node.value.elements;
            return elements.map(p => {
                return {
                    name: p.value
                };
            });
        }
        if (t.isObjectExpression(node.value)) {
            const properties = node.value.properties;
            return properties.map(p => {
                if (t.isObjectProperty(p)) {
                    if (t.isIdentifier(p.value) || t.isArrayExpression(p.value)) {
                        const prop = {
                            name: p.key.name,
                            type: generator_1.default(p.value).code,
                            comment: getConcatedComments_1.default(p.leadingComments || [])
                        };
                        return prop;
                    }
                    else if (t.isObjectExpression(p.value)) {
                        let prop = {
                            name: p.key.name,
                        };
                        p.value.properties.forEach(pp => {
                            if (t.isObjectProperty(pp) && pp.key.name === 'type') {
                                prop.type = generator_1.default(pp.value).code;
                            }
                            if (t.isObjectProperty(pp) && pp.key.name === 'required') {
                                prop.required = pp.value.value;
                            }
                            if (t.isObjectProperty(pp) && pp.key.name === 'default') {
                                if (t.isNumericLiteral(pp.value) || t.isStringLiteral(pp.value) || t.isBooleanLiteral(pp.value)) {
                                    prop.default = pp.value.value;
                                }
                                else if (t.isNullLiteral(pp.value)) {
                                    prop.default = null;
                                }
                                else if (t.isIdentifier(pp.value) && pp.value.name === 'undefined') {
                                    prop.default = undefined;
                                }
                                else if (t.isFunctionExpression(pp.value) || t.isArrowFunctionExpression(pp.value)) {
                                    prop.default = processFunctionProperty_1.default(pp);
                                }
                                else {
                                    console.warn('default not set as any of number,string,boolean,null,undefined,generator function');
                                    prop.default = 'invalid';
                                }
                            }
                            if (t.isObjectMethod(pp) && pp.key.name === 'default') {
                                prop.default = processFunctionProperty_1.default(pp);
                            }
                            if ((t.isObjectProperty(pp) || t.isObjectMethod(pp)) && pp.key.name === 'validator') {
                                prop.validator = processFunctionProperty_1.default(pp);
                            }
                        });
                        return prop;
                    }
                    else {
                        console.warn('some props value is invalid');
                        return null;
                    }
                }
                else {
                    console.warn('some props do not set as object property');
                    return null;
                }
            }).filter((v) => !!v);
        }
    }
    return [];
}
exports.default = default_1;
