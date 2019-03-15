"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("@babel/types");
const generator_1 = require("@babel/generator");
const utils_1 = require("../utils");
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
                            comment: utils_1.getConcatedComments(p.leadingComments || [])
                        };
                        return prop;
                    }
                    else if (t.isObjectExpression(p.value)) {
                        let _prop = {
                            name: '',
                            type: ''
                        };
                        p.value.properties.forEach(pp => {
                            if (t.isObjectProperty(pp) || t.isObjectMethod(pp)) {
                                if (pp.key.name === 'type') {
                                    _prop.type = generator_1.default(pp.value).code;
                                }
                            }
                        });
                        const typeNode = p.value.properties
                            .find((pp) => pp.key.name === 'type');
                        const type = typeNode ? generator_1.default(typeNode.value).code : '';
                        const requiredNode = p.value.properties
                            .find((pp) => pp.key.name === 'required');
                        const prop = {
                            name: p.key.name,
                            required: false,
                            type,
                            default: '',
                            validator: '',
                            comment: utils_1.getConcatedComments(p.leadingComments || []),
                        };
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
