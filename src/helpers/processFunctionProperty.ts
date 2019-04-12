import * as t from '@babel/types'
import generate from '@babel/generator'
import traverse, { NodePath, Node } from '@babel/traverse'

import { FunctionDescription } from '../ComponentTypes'
import { defaultParse } from '../scriptToAST'
/**
处理ObjectProperty和ObjectMethod注册的函数
*/

interface FunctionObjectProperty extends t.ObjectProperty {
  value: t.FunctionExpression | t.ArrowFunctionExpression
}
type FunctionProperty = FunctionObjectProperty | t.ObjectMethod

function isFunctionObjectProperty (node: t.ObjectProperty): node is FunctionObjectProperty {
  return t.isFunctionExpression(node.value) || t.isArrowFunctionExpression(node.value)
}

function getUsed (ast: FunctionProperty): string[] {
  const programedFunc = defaultParse(`var a = {${generate(ast).code}}`)
  const used: string[] = []
  traverse(programedFunc, {
    ThisExpression (path: NodePath<t.ThisExpression>) {
      used.push(generate(path.parent).code)
    }
  })
  return used
}

export default function processFunctionProperty (node: t.Node): FunctionDescription {
  if (t.isObjectProperty(node) && isFunctionObjectProperty(node)) {
    return {
      name: node.key.name as string,
      code: generate(node.value).code,
      use: getUsed(node)
    }
  } else if (t.isObjectMethod(node)) {
    return {
      name: node.key.name as string,
      code: generate(node).code,
      use: getUsed(node)
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
