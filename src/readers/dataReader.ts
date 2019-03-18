import { NodePath, Node } from '@babel/traverse'
import * as t from '@babel/types'

import { VueOptionName } from '../ComponentTypes'

export default function (nodeOfVueOptions: Map<VueOptionName, Node>) {
  const node = nodeOfVueOptions.get('data') as t.ObjectMethod | undefined
  // return node ? (node.value as t.StringLiteral).value : null
}