import { Node } from '@babel/traverse'
import * as t from '@babel/types'

import { VueOptionName, Method } from '../ComponentTypes'
import getConcatedComments from '../helpers/getConcatedComments'
import processFunctionProperty from '../helpers/processFunctionProperty'

export default function (nodeOfVueOptions: Map<VueOptionName, Node>): Method[] {
  const node = nodeOfVueOptions.get('methods') as t.ObjectProperty | undefined
  if (node && t.isObjectExpression(node)) {
    const properties = node.properties
    return properties.map(p => {
      return t.isSpreadElement(p) ? null : {
        comment: getConcatedComments(p.leadingComments || []),
        ...processFunctionProperty(p)
      }
    }).filter((v: Method | null): v is Method => !!v)
  }
  return []
}
