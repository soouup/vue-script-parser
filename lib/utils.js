"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getConcatedComments(comments) {
    return comments
        .reduce((sofar, comment) => {
        return [...sofar, comment.value.trim()];
    }, [])
        .join('\n');
}
exports.getConcatedComments = getConcatedComments;
