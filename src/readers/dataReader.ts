import { Node } from '@babel/traverse'
import * as t from '@babel/types'
import generate from '@babel/generator'

import { VueOptionName, Data } from '../ComponentTypes'
import getConcatedComments from '../helpers/getConcatedComments'

export default function (nodeOfVueOptions: Map<VueOptionName, Node>): Data[] {
  const node = nodeOfVueOptions.get('data') as t.ObjectMethod | undefined
  if (node && t.isBlockStatement(node.body)) {
    const returnData = node.body.body.find((n): n is t.ReturnStatement => t.isReturnStatement(n))
    if (returnData && returnData.argument && t.isObjectExpression(returnData.argument)) {
      const properties = returnData.argument.properties
      return properties.map(dataNode => {
        if (t.isObjectProperty(dataNode)) {
          const data: Data = {
            name: dataNode.key.name as string,
            value: generate(dataNode.value).code,
            comment: getConcatedComments(dataNode.leadingComments || [])
          }
          return data
        } else if (t.isObjectMethod(dataNode)) {
          const data: Data = {
            name: dataNode.key.name as string,
            value: generate(dataNode).code,
            comment: getConcatedComments(dataNode.leadingComments || [])
          }
          return data
        } else {
          return null
        }
      }).filter((v: Data | null): v is Data => !!v)
    } else {
      console.warn('no return found in data')
      return []
    }
  }
  return []
}
