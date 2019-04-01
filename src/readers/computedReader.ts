import { Node } from '@babel/traverse'
import * as t from '@babel/types'

import { VueOptionName, Computed } from '../ComponentTypes'
import getConcatedComments from '../helpers/getConcatedComments'
import processFunctionProperty, { isFunctionProperty } from '../helpers/processFunctionProperty'

export default function (nodeOfVueOptions: Map<VueOptionName, Node>): Computed[] {
  const node = nodeOfVueOptions.get('computed') as t.ObjectProperty | undefined
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
          func: processFunctionProperty(p)
        }
        // like aaaa:{get(){return 1},set(){xxx}}
      } else if (t.isObjectProperty(p)) {
        const baseInfo: Computed = {
          name: p.key.name as string,
          comment: getConcatedComments(p.leadingComments || [])
        }
        const value = p.value
        if (t.isObjectExpression(value)) {
          const comProperties = value.properties
          const mapedFunctionDesc = comProperties
            .filter((v: t.Node): v is t.ObjectMethod | t.ObjectProperty => !t.isSpreadElement(v))
            .map(v => processFunctionProperty(v))
          const getter = mapedFunctionDesc.find(v => v.name === 'get')
          const setter = mapedFunctionDesc.find(v => v.name === 'set')
          if (getter) {
            baseInfo.getter = getter
          }
          if (setter) {
            baseInfo.setter = setter
          }
        }
        return baseInfo
      }
      return null
    }).filter((v: Computed | null): v is Computed => !!v)
  }
  return []
}
