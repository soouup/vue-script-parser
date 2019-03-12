import { NodePath, Node } from '@babel/traverse'
import * as t from '@babel/types'

import { VueOptionName } from '../ComponentTypes'

export default function (nodeOfVueOptions: Map<VueOptionName, Node>) {
  const node = nodeOfVueOptions.get('props') as t.ObjectProperty | undefined
  if (node) {
    // like: props: [xxx,xxx,xxx]
    if (t.isArrayExpression(node.value)) {
      const elements = node.value.elements
      return elements.map(p => {
        return {
          name: (p as t.StringLiteral).value
        }
      })
    }
    // like: props: {xxx:xxx,xxx:xxx}
    if (t.isObjectExpression(node.value)) {

    }
  }
  return
}