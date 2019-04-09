import * as t from '@babel/types'
import generate from '@babel/generator'
import { FunctionDescription } from '../ComponentTypes'
/**
处理ObjectProperty和ObjectMethod注册的函数
*/

interface FunctionObjectProperty extends t.ObjectProperty {
  value: t.FunctionExpression | t.ArrowFunctionExpression
}
type FunctionProperty = FunctionObjectProperty | t.ObjectMethod

export default function processFunctionProperty (node: t.Node): FunctionDescription {
  if (t.isObjectProperty(node)) {
    if (t.isFunctionExpression(node.value) || t.isArrowFunctionExpression(node.value)) {
      return {
        name: node.key.name as string,
        code: generate(node.value).code,
        use: []
      }
    }
  } else if (t.isObjectMethod(node)) {
    return {
      name: node.key.name as string,
      code: generate(node).code,
      use: []
    }
  }
  // 不是function属性
  console.warn('node is not a function')
  return {
    name: '',
    code: '',
    use: []
  }
}

export function isFunctionProperty (node: t.Node): node is FunctionProperty {
  if (t.isObjectProperty(node)) {
    if (t.isFunctionExpression(node.value) || t.isArrowFunctionExpression(node.value)) {
      return true
    }
  } else if (t.isObjectMethod(node)) {
    return true
  }
  return false
}
