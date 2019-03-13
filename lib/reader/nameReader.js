"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(nodeOfVueOptions) {
    const node = nodeOfVueOptions.get('name');
    return node ? node.value.value : null;
}
exports.default = default_1;
