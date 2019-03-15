import * as t from '@babel/types'
import generator from '@babel/generator'
import { FunctionDescription } from '../ComponentTypes'
/**
处理ObjectProperty和ObjectMethod注册的函数
*/
// TODO use
export default function processFunctionProperty(funcNode: t.ObjectProperty | t.ObjectMethod): FunctionDescription {
  if (t.isObjectProperty(funcNode)) {
    if (!t.isFunctionExpression(funcNode)) {
      console.warn('not a function expression node')
      return {
        code: '',
        use: []
      }
    }
    return {
      code: generator(funcNode.value).code,
      use: []
    }
  } else {
    return {
      code: generator(funcNode).code,
      use: []
    }
  }
}