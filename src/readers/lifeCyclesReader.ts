import { Node } from '@babel/traverse'
import * as t from '@babel/types'

import { VueOptionName, LifeCycle, lifeCycleName } from '../ComponentTypes'
import getConcatedComments from '../helpers/getConcatedComments'
import processFunctionProperty, { isFunctionProperty } from '../helpers/processFunctionProperty'

export default function (nodeOfVueOptions: Map<VueOptionName, Node>): LifeCycle[] {
  return lifeCycleName
    .reduce((sofar: t.ObjectMethod[] | t.ObjectProperty[], name) => {
      const node = nodeOfVueOptions.get(name) as t.ObjectMethod | t.ObjectProperty | undefined
      if (node) {
        return [...sofar, node]
      }
      return sofar
    }, [])
    .map(lcNode => {
      if (t.isSpreadElement(lcNode)) {
        return null
      }
      if (isFunctionProperty(lcNode)) {
        return {
          comment: getConcatedComments(lcNode.leadingComments || []),
          ...processFunctionProperty(lcNode)
        }
      }
    })
    .filter((v: LifeCycle | null): v is LifeCycle => !!v)
}
