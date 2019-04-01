import * as t from '@babel/types'
import generate from '@babel/generator'
import { FunctionDescription } from '../ComponentTypes'
/**
处理ObjectProperty和ObjectMethod注册的函数
*/
// TODO use
export default function processFunctionProperty (funcNode: t.ObjectProperty | t.ObjectMethod): FunctionDescription {
  if (t.isObjectProperty(funcNode)) {
    if (!t.isFunctionExpression(funcNode.value) && !t.isArrowFunctionExpression(funcNode.value)) {
      console.warn('not a function expression node')
      return {
        name: '',
        code: '',
        use: []
      }
    }
    return {
      name: funcNode.key.name as string,
      code: generate(funcNode.value).code,
      use: []
    }
  } else {
    return {
      name: funcNode.key.name as string,
      code: generate(funcNode).code,
      use: []
    }
  }
}

export function isFunctionProperty (node: t.ObjectProperty | t.ObjectMethod): boolean {
  if (t.isObjectProperty(node)) {
    if (!t.isFunctionExpression(node.value) || !t.isArrowFunctionExpression(node.value)) {
      return false
    }
  }
  return true
}
