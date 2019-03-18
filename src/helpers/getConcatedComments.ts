import * as t from '@babel/types'

/**
将多个comment节点合并为一个注释字符串
*/
export default function getConcatedComments(comments: ReadonlyArray<t.Comment>): string {
  return comments
    .reduce((sofar: string[], comment: t.Comment) => {
      return [...sofar, comment.value.trim()]
    }, [])
    .join('\n')
}