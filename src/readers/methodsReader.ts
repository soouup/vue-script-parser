import { Node } from '@babel/traverse'
import * as t from '@babel/types'

import { VueOptionName, Method } from '../ComponentTypes'

export default function (nodeOfVueOptions: Map<VueOptionName, Node>): Method[] {
  const node = nodeOfVueOptions.get('methods') as t.ObjectProperty | undefined
  return []
}
