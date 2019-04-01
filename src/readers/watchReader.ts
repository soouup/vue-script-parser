import { Node } from '@babel/traverse'
import * as t from '@babel/types'

import { VueOptionName, Watch } from '../ComponentTypes'
import getConcatedComments from '../helpers/getConcatedComments'
import processFunctionProperty, { isFunctionProperty } from '../helpers/processFunctionProperty'

export default function (nodeOfVueOptions: Map<VueOptionName, Node>): Watch[] {
  const node = nodeOfVueOptions.get('watch') as t.ObjectProperty | undefined
  if (node && t.isObjectExpression(node.value)) {
    const properties = node.value.properties
    return properties.map(p => {
      if (t.isSpreadElement(p)) {
        return null
        // like: aaaa(){return '1'}
      } else if (isFunctionProperty(p)) {
        return {
          name: p.key.name as string,
          comment: getConcatedComments(p.leadingComments || []),
          hanlder: processFunctionProperty(p)
        }
        // like aaaa:{get(){return 1},set(){xxx}}
      } else if (t.isObjectProperty(p)) {
        const value = p.value
        if (t.isObjectExpression(value)) {
          const watchProperties = value.properties
          const handlerNode = watchProperties.find(v => !t.isSpreadElement(v) && v.key.name === 'handler') as t.ObjectProperty | t.ObjectMethod | undefined
          if (!handlerNode) {
            return null
          }
          const immediateNode = watchProperties.find(v => !t.isSpreadElement(v) && v.key.name === 'immediate') as t.ObjectProperty | undefined
          const deepNode = watchProperties.find(v => !t.isSpreadElement(v) && v.key.name === 'deep') as t.ObjectProperty | undefined
          const handler = processFunctionProperty(handlerNode)
          const immediate = immediateNode ? (immediateNode.value as t.BooleanLiteral).value : undefined
          const deep = deepNode ? (deepNode.value as t.BooleanLiteral).value : undefined
          const origin: Watch = {
            name: p.key.name as string,
            comment: getConcatedComments(p.leadingComments || []),
            handler
          }
          if (deep !== undefined) {
            origin.deep = deep
          }
          if (immediate !== undefined) {
            origin.immediate = immediate
          }
          return origin
        }
      }
      return null
    }).filter((v: Watch | null): v is Watch => !!v)
  }
  return []
}
